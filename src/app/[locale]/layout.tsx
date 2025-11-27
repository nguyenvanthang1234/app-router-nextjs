import React from 'react'
import initTranslations from 'src/configs/i18n'
import TranslationProvider from 'src/app/[locale]/TranslationProvider'
import { StoreWrapper } from 'src/hoc/StoreWrapper'
import ChatBotAI from 'src/components/chat-bot-ai'

const i18nNamespaces = ['translation']

export default async function Layout({ children, params: { locale } }: any) {
  const { resources } = await initTranslations(locale, i18nNamespaces)

  return (
    <TranslationProvider locale={locale} resources={resources} namespaces={i18nNamespaces}>
      <StoreWrapper>
        {children}
        <ChatBotAI />
      </StoreWrapper>
    </TranslationProvider>
  )
}
