/* eslint-disable */
// @ts-nocheck
// noinspection JSUnusedGlobalSymbols

import { Route as rootRouteImport } from './routes/__root'
import { Route as TermosRouteImport } from './routes/termos'
import { Route as SitemapDotxmlRouteImport } from './routes/sitemap[.]xml'
import { Route as PrivacidadeRouteImport } from './routes/privacidade'
import { Route as LoginRouteImport } from './routes/login'
import { Route as AppRouteImport } from './routes/app'
import { Route as IndexRouteImport } from './routes/index'
import { Route as CadastroParceiroRouteImport } from './routes/cadastro.parceiro'
import { Route as CadastroClienteRouteImport } from './routes/cadastro.cliente'
import { Route as ParceiroDashboardRouteImport } from './routes/parceiro/dashboard'
import { Route as ParceiroCardapioRouteImport } from './routes/parceiro/cardapio'
import { Route as AppCarrinhoRouteImport } from './routes/app.carrinho'

const TermosRoute = TermosRouteImport.update({ id: '/termos', path: '/termos', getParentRoute: () => rootRouteImport } as any)
const SitemapDotxmlRoute = SitemapDotxmlRouteImport.update({ id: '/sitemap.xml', path: '/sitemap.xml', getParentRoute: () => rootRouteImport } as any)
const PrivacidadeRoute = PrivacidadeRouteImport.update({ id: '/privacidade', path: '/privacidade', getParentRoute: () => rootRouteImport } as any)
const LoginRoute = LoginRouteImport.update({ id: '/login', path: '/login', getParentRoute: () => rootRouteImport } as any)
const AppRoute = AppRouteImport.update({ id: '/app', path: '/app', getParentRoute: () => rootRouteImport } as any)
const IndexRoute = IndexRouteImport.update({ id: '/', path: '/', getParentRoute: () => rootRouteImport } as any)
const CadastroParceiroRoute = CadastroParceiroRouteImport.update({ id: '/cadastro/parceiro', path: '/cadastro/parceiro', getParentRoute: () => rootRouteImport } as any)
const CadastroClienteRoute = CadastroClienteRouteImport.update({ id: '/cadastro/cliente', path: '/cadastro/cliente', getParentRoute: () => rootRouteImport } as any)
const ParceiroDashboardRoute = ParceiroDashboardRouteImport.update({ id: '/parceiro/dashboard', path: '/parceiro/dashboard', getParentRoute: () => rootRouteImport } as any)
const ParceiroCardapioRoute = ParceiroCardapioRouteImport.update({ id: '/parceiro/cardapio', path: '/parceiro/cardapio', getParentRoute: () => rootRouteImport } as any)
const AppCarrinhoRoute = AppCarrinhoRouteImport.update({ id: '/app/carrinho', path: '/app/carrinho', getParentRoute: () => rootRouteImport } as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/app': typeof AppRoute
  '/login': typeof LoginRoute
  '/privacidade': typeof PrivacidadeRoute
  '/sitemap.xml': typeof SitemapDotxmlRoute
  '/termos': typeof TermosRoute
  '/cadastro/cliente': typeof CadastroClienteRoute
  '/cadastro/parceiro': typeof CadastroParceiroRoute
  '/parceiro/dashboard': typeof ParceiroDashboardRoute
  '/parceiro/cardapio': typeof ParceiroCardapioRoute
  '/app/carrinho': typeof AppCarrinhoRoute
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/app': typeof AppRoute
  '/login': typeof LoginRoute
  '/privacidade': typeof PrivacidadeRoute
  '/sitemap.xml': typeof SitemapDotxmlRoute
  '/termos': typeof TermosRoute
  '/cadastro/cliente': typeof CadastroClienteRoute
  '/cadastro/parceiro': typeof CadastroParceiroRoute
  '/parceiro/dashboard': typeof ParceiroDashboardRoute
  '/parceiro/cardapio': typeof ParceiroCardapioRoute
  '/app/carrinho': typeof AppCarrinhoRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/app': typeof AppRoute
  '/login': typeof LoginRoute
  '/privacidade': typeof PrivacidadeRoute
  '/sitemap.xml': typeof SitemapDotxmlRoute
  '/termos': typeof TermosRoute
  '/cadastro/cliente': typeof CadastroClienteRoute
  '/cadastro/parceiro': typeof CadastroParceiroRoute
  '/parceiro/dashboard': typeof ParceiroDashboardRoute
  '/parceiro/cardapio': typeof ParceiroCardapioRoute
  '/app/carrinho': typeof AppCarrinhoRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/app' | '/login' | '/privacidade' | '/sitemap.xml' | '/termos' | '/cadastro/cliente' | '/cadastro/parceiro' | '/parceiro/dashboard' | '/parceiro/cardapio' | '/app/carrinho'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/app' | '/login' | '/privacidade' | '/sitemap.xml' | '/termos' | '/cadastro/cliente' | '/cadastro/parceiro' | '/parceiro/dashboard' | '/parceiro/cardapio' | '/app/carrinho'
  id: '__root__' | '/' | '/app' | '/login' | '/privacidade' | '/sitemap.xml' | '/termos' | '/cadastro/cliente' | '/cadastro/parceiro' | '/parceiro/dashboard' | '/parceiro/cardapio' | '/app/carrinho'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AppRoute: typeof AppRoute
  LoginRoute: typeof LoginRoute
  PrivacidadeRoute: typeof PrivacidadeRoute
  SitemapDotxmlRoute: typeof SitemapDotxmlRoute
  TermosRoute: typeof TermosRoute
  CadastroClienteRoute: typeof CadastroClienteRoute
  CadastroParceiroRoute: typeof CadastroParceiroRoute
  ParceiroDashboardRoute: typeof ParceiroDashboardRoute
  ParceiroCardapioRoute: typeof ParceiroCardapioRoute
  AppCarrinhoRoute: typeof AppCarrinhoRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': { id: '/'; path: '/'; fullPath: '/'; preLoaderRoute: typeof IndexRouteImport; parentRoute: typeof rootRouteImport }
    '/app': { id: '/app'; path: '/app'; fullPath: '/app'; preLoaderRoute: typeof AppRouteImport; parentRoute: typeof rootRouteImport }
    '/login': { id: '/login'; path: '/login'; fullPath: '/login'; preLoaderRoute: typeof LoginRouteImport; parentRoute: typeof rootRouteImport }
    '/privacidade': { id: '/privacidade'; path: '/privacidade'; fullPath: '/privacidade'; preLoaderRoute: typeof PrivacidadeRouteImport; parentRoute: typeof rootRouteImport }
    '/sitemap.xml': { id: '/sitemap.xml'; path: '/sitemap.xml'; fullPath: '/sitemap.xml'; preLoaderRoute: typeof SitemapDotxmlRouteImport; parentRoute: typeof rootRouteImport }
    '/termos': { id: '/termos'; path: '/termos'; fullPath: '/termos'; preLoaderRoute: typeof TermosRouteImport; parentRoute: typeof rootRouteImport }
    '/cadastro/cliente': { id: '/cadastro/cliente'; path: '/cadastro/cliente'; fullPath: '/cadastro/cliente'; preLoaderRoute: typeof CadastroClienteRouteImport; parentRoute: typeof rootRouteImport }
    '/cadastro/parceiro': { id: '/cadastro/parceiro'; path: '/cadastro/parceiro'; fullPath: '/cadastro/parceiro'; preLoaderRoute: typeof CadastroParceiroRouteImport; parentRoute: typeof rootRouteImport }
    '/parceiro/dashboard': { id: '/parceiro/dashboard'; path: '/parceiro/dashboard'; fullPath: '/parceiro/dashboard'; preLoaderRoute: typeof ParceiroDashboardRouteImport; parentRoute: typeof rootRouteImport }
    '/parceiro/cardapio': { id: '/parceiro/cardapio'; path: '/parceiro/cardapio'; fullPath: '/parceiro/cardapio'; preLoaderRoute: typeof ParceiroCardapioRouteImport; parentRoute: typeof rootRouteImport }
    '/app/carrinho': { id: '/app/carrinho'; path: '/app/carrinho'; fullPath: '/app/carrinho'; preLoaderRoute: typeof AppCarrinhoRouteImport; parentRoute: typeof rootRouteImport }
  }
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute,
  AppRoute,
  LoginRoute,
  PrivacidadeRoute,
  SitemapDotxmlRoute,
  TermosRoute,
  CadastroClienteRoute,
  CadastroParceiroRoute,
  ParceiroDashboardRoute,
  ParceiroCardapioRoute,
  AppCarrinhoRoute,
}

export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()
