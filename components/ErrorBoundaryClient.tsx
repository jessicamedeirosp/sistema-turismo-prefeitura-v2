'use client'

import React from 'react'

interface Props {
  children: React.ReactNode
  onError?: (error: Error, info?: any) => void
}

interface State {
  hasError: boolean
}

export default class ErrorBoundaryClient extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: any) {
    console.error('[ErrorBoundaryClient] caught error', error, info)
    this.props.onError?.(error, info)
  }

  render() {
    if (this.state.hasError) {
      return null
    }
    return this.props.children
  }
}
