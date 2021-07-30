import { createRouter, createWebHistory } from 'vue-router'
// 手动控制应用加载
import { loadMicroApp } from 'qiankun'
import apps from '../modules/apps'
import Home from '../views/Home.vue'

// 缓存应用实例
const microList = new Map([])
// 当前应用配置
let current

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach(async (to, from, next) => {
  const conf = apps.find(item => to.path.indexOf(item.activeRule) !== -1)

  // 应用跳转
  if (conf) {
    // 未切换子应用
    if (current && current.activeRule === conf.activeRule) {
      next()
      return
    }

    const cacheMicro = microList.get(conf.activeRule)

    // 已缓存应用
    if (cacheMicro) {
      next()
      return
    }

    // 未缓存应用
    const micro = loadMicroApp({ ...conf, router })

    microList.set(conf.activeRule, micro)
    current = conf
    next()
  }

  // 主应用内跳转
  next()
})
export default router
