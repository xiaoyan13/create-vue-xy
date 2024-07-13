# create-vue-xy

An Out-of-the-Box Scaffolding with Vue.js.

## 使用方式

打开终端，使用如下命令：

```sh
pnpm create vue-xy
```

> [!NOTE]
> 项目只支持一种包管理器 pnpm。这主要是为了保证 lock.json 锁定依赖版本。当然，使用 `corepack` 也可以。

选择需要的选项，之后就可以运行了：

```sh
pnpm dev
pnpm lint
pnpm lint:inspect
```

## 基础配置

默认的配置包含了:

- vue + vite + ts, tailwindcss
- 从 0 配置的必要语法检查和格式化。
- 清除了所有默认的 css 样式；只提供了干净的唯一组件 `MainView`, 空的 `router` 和 `pinia` 状态库.
- 提供了一些有用的 `.vscode` 工程配置: `tailwindcss` 的 `@` 指令语法提示支持和 `vue` 的 `code-snippets`.
- 一些(自认为)通用的 `vite` 插件.

## 可选配置

有几个可选项：`utils`, `axios`, `devtools/vue-devtools`。

`utils` 提供了一些可能有用的封装：

- 实现了极小的 _eventBus_
- 对 vue 本身提供的 _provide_ 和 _inject_ 进行了二次封装，使用局部上下文来代替全局状态管理；

`axios` 选项配置了通用的 `axios` 请求封装：

- 开箱即用的 `axios` 的请求封装, 并支持多环境切换: `mock`, `dev`, `prod`。

`devtools/vue-devtools` 选项，会引入 `vue-devtools` 的 vite 插件。

以上这些可选配置也可以通过命令行参数来选择，如：

```sh
pnpm create vue-xy --axios # 启用 axios
```

> [!WARNING]
> 需要注意，一旦传入 `--` 的命令行参数，则不会再提供这些可选配置的交互行为。

其他还有一些配置是默认的：

- 项目提供了开箱即用的多语言支持, 内置 [`vue-i18n@9`](https://github.com/intlify/vue-i18n) 的配置。

## VSCode

在正式开始之前，可能还需要调整一下 vscode：

**代码库适用于 vscode**. 必需安装的 `vsc` 插件:

- vue 官方插件
- eslint 官方插件
- tailwind 官方插件
- prettier 官方插件

> [!WARNING]
> 注意本地已经存在的插件可能会覆盖掉上述插件某些功能，从而影响语法提示，进而影响食用体验。

- 可选的插件：`i18n`
