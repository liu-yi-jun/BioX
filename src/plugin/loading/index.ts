import type { App } from 'vue'
import { createVNode, render } from 'vue'
import Loading from './loading.vue'
 
export default {
  install(app: App) {
    console.log('全局Loadig插件执行了')
    // 将vue组件转为VNode，然后渲染到页面上
    const VNode = createVNode(Loading)
    render(VNode, document.body)
    // 给Vue对象全局挂载属性show、hide
    app.config.globalProperties.loading = {
      show: VNode.component?.exposed?.show,
      hide: VNode.component?.exposed?.hide
    }
    console.log('挂载点属性:', VNode.component?.exposed, app.config.globalProperties.loading)
  }
}