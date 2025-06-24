interface Window extends Window {
    dataDevice: unknown[]
  
    performance: {
        memory: {
            jsHeapSizeLimit: string | string
        }
    }

  }