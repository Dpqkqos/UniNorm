import { createRouter, createWebHistory } from "vue-router";
import RegistrationForm from "@/components/RegistrationForm.vue";
import MainInterface from "@/components/MainInterface.vue";

const routes = [
  { path: "/", component: RegistrationForm },
  { path: "/main", component: MainInterface },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
