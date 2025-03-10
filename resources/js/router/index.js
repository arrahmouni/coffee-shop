import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/auth/Login.vue'
import Register from '../views/auth/Register.vue'
import Dashboard from "../views/Dashboard.vue";
import DashboardHome from "../views/dashboard/Home.vue";
import NotFound from '../views/errors/404.vue'
import Categories from '../views/dashboard/Categories.vue';
import Products from '../views/dashboard/Products.vue';

const routes = [
    {
        path: '/admin/login',
        component: Login,
        meta: { guest: true }
    },
    {
        path: '/admin/register',
        component: Register,
        meta: { guest: true }
    },
    {
        path: '/admin/:pathMatch(.*)*',
        component: NotFound
    },
    {
        path: '/admin/dashboard',
        component: Dashboard,
        meta: { requiresAuth: true },
        children: [
            {
                path: '',
                component: DashboardHome,
                name: 'Home'
            },
            {
                path: 'categories',
                component: Categories,
                name: 'Categories'
            },
            {
                path: 'products',
                component: Products,
                name: 'Products'
            }
        ]
    },
    {
        path: '/admin/email-verification',
        component: () => import('../views/auth/EmailVerify.vue'),
        meta: { guest: true }
    },
    {
        path: '/admin/email-verification-success',
        component: () => import('../views/auth/EmailVerifySuccess.vue'),
        meta: { guest: true }
    },
    {
        path: '/admin/email-verification-failed',
        component: () => import('../views/auth/EmailVerifyFailure.vue'),
        meta: { guest: true }
    },
    {
        path: '/admin/forgot-password',
        component: () => import('../views/auth/ForgotPassword.vue'),
        meta: { guest: true }
    },
    {
        path: '/admin/reset-password',
        component: () => import('../views/auth/ResetPassword.vue'),
        meta: { guest: true },
        props: (route) => ({
            token: route.query.token,
            email: route.query.email
        })
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach(async (to, from, next) => {
    if (to.meta.requiresAuth) {
        const token = localStorage.getItem('authToken');

        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            try {
                await axios.get('/user');
                next();
            } catch (error) {
                localStorage.removeItem('authToken');
                delete axios.defaults.headers.common['Authorization'];
                next('/admin/login');
            }
        } else {
            next('/admin/login');
        }
    } else if (to.meta.guest) {
        const token = localStorage.getItem('authToken');

        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            try {
                await axios.get('/user');
                next('/admin/dashboard');
            } catch (error) {
                localStorage.removeItem('authToken');
                delete axios.defaults.headers.common['Authorization'];
                next();
            }
        } else {
            next();
        }
    }

    else {
        next();
    }
});

export default router
