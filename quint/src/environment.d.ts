declare global {
  namespace NodeJS {
    interface ProcessEnv {
      RETRY_NONDET_SMALLER_THAN?: string
    }
  }
}

export {}
