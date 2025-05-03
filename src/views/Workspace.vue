<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
import { onMounted } from 'vue';

const auth = useAuthStore();
onMounted(() => {
    axios.get('/api/design', {
        params: {
            userId: auth.id,
        },
        headers: {
            Authorization: `Bearer ${auth.jwtToken}`
        }
    }).then(res => {
        console.log(res);
    }).catch(err => {
        const statusCode = err.status;
        switch (statusCode) {
            default:
                console.error("Unhandled error status:", statusCode);
        }
    })

})
</script>

<template>
    <div>

    </div>
</template>