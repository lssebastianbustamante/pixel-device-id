
declare module 'vtex.render-runtime' {

    export interface NavigationOptions {
      page: string
      params?: unknown
    }
    export const canUseDOM: boolean
    export interface RenderContextProps {
      runtime: {
        navigate: (options: NavigationOptions) => void
      }
    }

  }
