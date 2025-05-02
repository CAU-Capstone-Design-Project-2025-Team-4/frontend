<script setup lang="ts">
import Modal from '@/components/common/Modal.vue';
import { useFetch } from '@vueuse/core';
import axios from 'axios';
import { computed, ref, useTemplateRef } from 'vue';

const loginModal = useTemplateRef<InstanceType<typeof Modal>>('login-modal');

const email = ref<string>("");
const emailWarning = ref<string>("");

const password = ref<string>("");
const passwordWarning = ref<string>("");
const viewPassword = ref<boolean>(false);

function handleEmailInput() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email.value.length > 0 && !emailRegex.test(email.value)) {
        emailWarning.value = "@를 포함한 이메일 주소를 입력해주세요."
    } else {
        emailWarning.value = "";
    }
}

function handlePasswordInput() {
    passwordWarning.value = "";
}

interface LoginResponseDTO {
    jwtToken: string,
    id: number,
    name: string,
    email: string
}

async function tryLogin() {
    if (emailWarning.value.length > 0 || passwordWarning.value.length > 0) return;

    axios.post('/api/user/login', {
        email: email.value,
        password: password.value
    }).then(res => {
        const loginResponse: LoginResponseDTO = res.data.data;
        localStorage.setItem('jwtToken', loginResponse.jwtToken);
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


function resetLoginModal() {
    email.value = "";
    emailWarning.value = "";
    password.value = "";
    passwordWarning.value = "";
    viewPassword.value = false;
}


</script>


<template>
    <div>
        <button @click="loginModal?.open()" class="btn border-0">Login</button>
        
        <Modal ref="login-modal" @closed="resetLoginModal()">
            <p class="font-bold text-xl mb-8">PRISM 로그인</p>

            <form @submit.prevent="tryLogin()">
                <div class="relative w-80 mb-4">
                    <p class="mb-1">이메일</p>
                    <input v-model="email" @input="handleEmailInput()" class="block w-full h-10 px-2 text-sm rounded-md border border-gray-300
                    outline-teal-500 hover:border-teal-500" placeholder="ID@example.com" />
                    <p v-show="emailWarning.length > 0" class="text-sm text-red-700 mt-1">{{ emailWarning }}</p>
                </div>

                <div class="relative w-80 mb-6">
                    <p class="mb-1">비밀번호</p>
                    <input v-model="password" @input="handlePasswordInput()" :type="viewPassword ? '' : 'password'" class="block w-full h-10 pr-8 px-2 text-sm rounded-md border border-gray-300
                    outline-teal-500 hover:border-teal-500" placeholder="비밀번호를 입력해주세요." />
                    <div class="absolute right-2 top-9 w-6 h-6 p-1 rounded-md hover-bg-gray-100" @pointerdown="viewPassword = !viewPassword">
                        <div :class="viewPassword ? 'i-mdi:eye-outline' : 'i-mdi:eye-off-outline'" />
                    </div>   
                    <p v-show="passwordWarning.length > 0" class="text-sm text-red-700 mt-1">{{ passwordWarning }}</p>
                </div>

                <button type="submit" class="btn w-80 h-10 p-0 mb-4 rounded-md border-0 bg-teal-500 focus:brightness-110" :style="{ outline: 'none' }">
                    <p class="text-sm text-white font-bold leading-10">로그인</p>
                </button>
            </form>       
            
            <div class="flex justify-center">
                <p class="text-gray-500 mr-2">아직 회원이 아니신가요?</p>
                <p class="font-bold text-teal-500">회원 가입</p>
            </div>
        </Modal>


        <router-link to='/editor'>
            Hello World!
        </router-link>
    </div>
    
</template>