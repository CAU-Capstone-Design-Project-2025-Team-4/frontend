<script setup lang="ts">
import router from '@/router';
import Modal from '@/components/common/Modal.vue';
import Profile from '@/components/Profile.vue';
import { useAuthStore } from '@/stores/auth';
import type { LoginResponseDTO } from '@/types/DTO';
import { computed, ref, useTemplateRef } from 'vue';
import api from '@/api/api';

const auth = useAuthStore();

const loginModal = useTemplateRef<InstanceType<typeof Modal>>('login-modal');
const registerModal = useTemplateRef<InstanceType<typeof Modal>>('register-modal');

const name = ref<string>("");
const nameWarning = ref<string>("");

const email = ref<string>("");
const emailWarning = ref<string>("");

const password = ref<string>("");
const passwordWarning = ref<string>("");
const viewPassword = ref<boolean>(false);

const confirmPassword = ref<string>("");
const viewConfirmPassword = ref<boolean>(false);

function handleNameInput() {
    nameWarning.value = "";
}

function handleEmailInput() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email.value.length > 0 && !emailRegex.test(email.value)) {
        emailWarning.value = "@를 포함한 이메일 주소를 입력해주세요."
    } else {
        emailWarning.value = "";
    }
}

function handlePasswordInput() {
    if (confirmPassword.value.length != 0) {
        if (password.value != confirmPassword.value) {
            passwordWarning.value = "비밀번호가 일치하지 않습니다."
        } else {
            passwordWarning.value = "";
        }
    } else {
        passwordWarning.value = "";
    }
}

function handleConfirmPasswordInput() {
    if (password.value != confirmPassword.value) {
        passwordWarning.value = "비밀번호가 일치하지 않습니다."
    } else {
        passwordWarning.value = "";
    }
}


async function tryLogin() {
    if (email.value.length == 0 || password.value.length == 0) return;
    if (emailWarning.value.length > 0 || passwordWarning.value.length > 0) return;

    api.post('/user/login', {
        email: email.value,
        password: password.value
    }).then(res => {
        const loginResponse: LoginResponseDTO = res.data.data;
        auth.login(loginResponse);

        console.log('login success.', loginResponse);

        loginModal.value?.close();
    }).catch(err => {
        const statusCode = err.status;
        switch (statusCode) {
            case 400:
                passwordWarning.value = "잘못된 비밀번호입니다.";
                break;
            case 404:
                emailWarning.value = "존재하지 않는 이메일입니다."
                break;
            default:
                console.error("Unhandled error status:", statusCode);
        }
    });
}

const registerDisabled = computed<boolean>(() => {
    if (name.value.length == 0 || email.value.length == 0 || password.value.length == 0 || confirmPassword.value.length == 0) return true;
    if (nameWarning.value.length > 0 || emailWarning.value.length > 0 || passwordWarning.value.length > 0) return true;
    return false;
});


async function tryRegister() {
    if (registerDisabled.value) return;

    api.post('/user/register', {
        email: email.value,
        name: name.value,
        password: password.value,
        confirmPassword: confirmPassword.value
    }).then(_res => {
        window.alert("회원 가입에 성공했습니다!");
        tryLogin();

        registerModal.value?.close();
    }).catch(err => {
        const statusCode = err.status;
        switch (statusCode) {
            case 400:
                emailWarning.value = "이미 존재하는 이메일입니다."
                break;
            default:
                console.error("Unhandled error status:", statusCode);
        }
    });
}

function resetLoginModal() {
    email.value = "";
    emailWarning.value = "";
    password.value = "";
    passwordWarning.value = "";
    viewPassword.value = false;
}

function resetRegisterModal() {
    name.value = "";
    nameWarning.value = "";
    email.value = "";
    emailWarning.value = "";
    password.value = "";
    passwordWarning.value = "";
    viewPassword.value = false;
}

function toEditorView() {
    // router.push('/editor');
}

function toGalleryView() {
    router.push('/gallery');
}
</script>

<template>
    <div class="flex justify-center w-screen h-16 px-4 py-2 border-b border-gray-200">
        <div class="flex justify-between w-screen-xl">
            <button @pointerup.left="router.push('/')" class="text-2xl leading-12">P R I S M</button>
            <button @pointerup.left="toGalleryView()" class="ml-8 hover:text-teal-500 hover:font-bold"
            :class="{ 'text-teal-500 font-bold': router.currentRoute.value.name === 'Gallery' || router.currentRoute.value.name === 'Post' }">갤러리</button>

            <div class="flex ml-auto">
                <div v-if="!auth.isAuthenticated" class="flex">
                    <button @click="loginModal?.open()" class="w-20 h-12 p-2 mr-2 rounded-md  hover:bg-gray-200">로그인</button>
                    <button @click="registerModal?.open()" class="w-40 h-12 p-2 rounded-md bg-teal-500 focus:brightness-110 hover:brightness-110">
                        <p class="text-white">회원 가입</p>
                    </button>
                </div>

                <div v-else class="flex">
                    <button @click="toEditorView()" class="w-40 h-12 p-2 mr-2 rounded-md bg-teal-500 focus:brightness-110 hover:brightness-110">
                        <p class="text-white">디자인 만들기</p>
                    </button>
                    <Profile />
                </div>
            </div> 
        </div>
    </div>

    <Modal ref="login-modal" @closed="resetLoginModal()">
        <p class="font-bold text-xl mb-8 select-none">PRISM 로그인</p>

        <form @submit.prevent="tryLogin()">
            <div class="relative w-80 mb-4">
                <p class="mb-1 select-none">이메일</p>
                <input v-model="email" @input="handleEmailInput()" placeholder="ID@example.com" 
                class="block w-full h-10 px-2 text-sm rounded-md border border-gray-300"
                :class="emailWarning.length > 0 ? 'outline-red-700 border-red-700 hover:border-red-700' : 'outline-teal-500 hover:border-teal-500'" />
                <p v-show="emailWarning.length > 0" class="text-sm text-red-700 mt-1">{{ emailWarning }}</p>
            </div>

            <div class="relative w-80 mb-4">
                <p class="mb-1 select-none">비밀번호</p>
                <input v-model="password" @input="handlePasswordInput()" :type="viewPassword ? '' : 'password'" placeholder="비밀번호를 입력해주세요."
                class="block w-full h-10 px-2 text-sm rounded-md border border-gray-300"
                :class="passwordWarning.length > 0 ? 'outline-red-700 border-red-700 hover:border-red-700' : 'outline-teal-500 hover:border-teal-500'" />
                <div class="absolute right-2 top-9 w-6 h-6 p-1 rounded-md hover-bg-gray-100" @pointerdown="viewPassword = !viewPassword">
                    <div :class="viewPassword ? 'i-mdi:eye-outline' : 'i-mdi:eye-off-outline'" />
                </div>   
                <p v-show="passwordWarning.length > 0" class="text-sm text-red-700 mt-1">{{ passwordWarning }}</p>
            </div>

            <button type="submit" class="btn w-80 h-10 mb-4 rounded-md bg-teal-500 focus:brightness-110 hover:brightness-110">
                <p class="text-sm text-white font-bold leading-10">로그인</p>
            </button>
        </form>       
        
        <div class="flex justify-center">
            <p class="text-gray-500 mr-2 select-none">아직 회원이 아니신가요?</p>
            <button class="font-bold text-teal-500 select-none"
            @pointerup.left="loginModal?.close(); registerModal?.open()">회원 가입</button>
        </div>
    </Modal>

    <Modal ref="register-modal" @closed="resetRegisterModal()">
        <p class="font-bold text-xl mb-8 select-none">PRISM 가입</p>

        <form @submit.prevent="tryRegister()">
            <div class="relative w-80 mb-4">
                <p class="mb-1 select-none">이름</p>
                <input v-model="name" @input="handleNameInput()" placeholder="이름을 입력해주세요." 
                class="block w-full h-10 px-2 text-sm rounded-md border border-gray-300"
                :class="nameWarning.length > 0 ? 'outline-red-700 border-red-700 hover:border-red-700' : 'outline-teal-500 hover:border-teal-500'" />
                <p v-show="nameWarning.length > 0" class="text-sm text-red-700 mt-1">{{ nameWarning }}</p>
            </div>

            <div class="relative w-80 mb-4">
                <p class="mb-1 select-none">이메일</p>
                <input v-model="email" @input="handleEmailInput()" placeholder="ID@example.com" 
                class="block w-full h-10 px-2 text-sm rounded-md border border-gray-300"
                :class="emailWarning.length > 0 ? 'outline-red-700 border-red-700 hover:border-red-700' : 'outline-teal-500 hover:border-teal-500'" />
                <p v-show="emailWarning.length > 0" class="text-sm text-red-700 mt-1">{{ emailWarning }}</p>
            </div>

            <div class="relative w-80 mb-8">
                <p class="mb-1 select-none">비밀번호</p>
                <input v-model="password" @input="handlePasswordInput()" :type="viewPassword ? '' : 'password'" placeholder="비밀번호를 입력해주세요."
                class="block w-full h-10 px-2 mb-2 text-sm rounded-md border border-gray-300"
                :class="passwordWarning.length > 0 ? 'outline-red-700 border-red-700 hover:border-red-700' : 'outline-teal-500 hover:border-teal-500'" />
                <div class="absolute right-2 top-9 w-6 h-6 p-1 rounded-md hover-bg-gray-100" @pointerdown="viewPassword = !viewPassword">
                    <div :class="viewPassword ? 'i-mdi:eye-outline' : 'i-mdi:eye-off-outline'" />
                </div>   

                <input v-model="confirmPassword" @input="handleConfirmPasswordInput()" :type="viewConfirmPassword ? '' : 'password'" placeholder="비밀번호를 한 번 더 입력해주세요."
                class="block w-full h-10 px-2 text-sm rounded-md border border-gray-300"
                :class="passwordWarning.length > 0 ? 'outline-red-700 border-red-700 hover:border-red-700' : 'outline-teal-500 hover:border-teal-500'" />
                <div class="absolute right-2 top-21 w-6 h-6 p-1 rounded-md hover-bg-gray-100" @pointerdown="viewConfirmPassword = !viewConfirmPassword">
                    <div :class="viewConfirmPassword ? 'i-mdi:eye-outline' : 'i-mdi:eye-off-outline'" />
                </div>  

                <p v-show="passwordWarning.length > 0" class="text-sm text-red-700 mt-1">{{ passwordWarning }}</p>
            </div>

            <button type="submit" :disabled="registerDisabled" class="btn w-80 h-10 mb-4 rounded-md bg-teal-500 
            focus:brightness-110 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed">
                <p class="text-sm text-white font-bold leading-10">가입하기</p>
            </button>

            <div class="flex justify-center">
                <p class="text-gray-500 mr-2 select-none">이미 회원이신가요?</p>
                <button class="font-bold text-teal-500 select-none"
                @pointerup.left="registerModal?.close(); loginModal?.open()">로그인</button>
            </div>
        </form>       
    </Modal>
</template>

<style>
button {
    border: 0;
    padding: 0;
}
button:focus {
    outline: none;
}
</style>