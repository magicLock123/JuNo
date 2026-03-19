import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { useUserStore } from "@/store/user";
import { ElMessage } from "element-plus";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/login",
    component: () => import("@/views/login/index.vue"),
    meta: { title: "登录" },
  },
  {
    path: "/",
    component: () => import("@/layout/index.vue"),
    redirect: "/profile", // 🌟 修改 1：访问根目录默认重定向到个人中心
    children: [
      {
        path: "hall",
        component: () => import("@/views/dashboard/index.vue"),
        meta: {
          title: "抢单大厅",
          requiresAuth: true,
          roles: ["Admin", "Mercenary"],
        },
      },
      {
        path: "player-management",
        component: () => import("@/views/PlayerManagement/index.vue"),
        meta: { title: "打手管理", requiresAuth: true, roles: ["Admin"] },
      },
      {
        path: "dispatch",
        component: () => import("@/views/dispatch/index.vue"),
        meta: {
          title: "派单中心",
          requiresAuth: true,
          roles: ["Admin", "Dispatcher"],
        },
      },
      {
        path: "after-sales",
        component: () => import("@/views/after-Sales/index.vue"),
        meta: {
          title: "售后处理",
          requiresAuth: true,
          roles: ["Admin", "Dispatcher"],
        },
      },
      {
        path: "history",
        component: () => import("@/views/history/index.vue"),
        meta: {
          title: "历史订单",
          requiresAuth: true,
          roles: ["Admin", "Dispatcher"],
        },
      },
      {
        path: '/finance',
        component: () => import('@/views/finance/index.vue'),
        meta: {
          title: '公司财务看板',
          requiresAuth: true,
          roles: ["Admin"]
        } // 仅限 Admin
      },
      {
        path: "profile",
        component: () => import("@/views/profile/index.vue"),
        meta: {
          title: "个人中心",
          requiresAuth: true,
          roles: ["Admin", "Mercenary", "Dispatcher"],
        },
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/profile", // 🌟 修改 2：匹配不到的瞎填路由也重定向到个人中心
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();

  if (to.meta.title) {
    document.title = `${to.meta.title} - 竹诺电竞`;
  }

  if (to.path === "/login" && userStore.isLogin) {
    return next("/profile");
  }

  if (to.meta.requiresAuth && !userStore.isLogin) {
    ElMessage.warning("请先登录系统");
    return next("/login");
  }

  if (to.meta.roles) {
    const userRole = userStore.role;
    const allowRoles = to.meta.roles as string[];

    if (!allowRoles.includes(userRole)) {
      ElMessage.error("越权访问：您没有该页面的查看权限");
      if (from.path === "/login" || from.path === "/") {
        return next("/profile");
      } else {
        return next(false);
      }
    }
  }

  next();
});

export default router;