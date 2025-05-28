declare global {
  namespace NodeJS {
    interface ProcessEnv {
      QUINT_RETRY_NONDET_SMALLER_THAN?: string
    }
  }
}

export {}
