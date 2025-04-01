import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        component: () => import('@/views/Main.vue')
    },
    {
        path: '/editor',
        component: () => import('@/views/Editor.vue')
    },
];

export default createRouter({
    history: createWebHistory(),
    routes
});
