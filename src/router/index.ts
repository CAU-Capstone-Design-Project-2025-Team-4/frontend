import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'Main',
        component: () => import('@/views/Main.vue')
    },
    {
        path: '/workspace',
        name: 'Workspace',
        component: () => import('@/views/Workspace.vue')
    },
    {
        path: '/editor',
        name: 'Editor',
        component: () => import('@/views/Editor.vue')
    },
    {
        path: '/show',
        name: 'Show',
        component: () => import('@/views/SlideShow.vue')
    }
];

export default createRouter({
    history: createWebHistory(),
    routes
});
