import {queryHook} from './queryHookUtil';
import {apiClient} from "../client";


export const useExchangeFinder = queryHook({fetcher: apiClient.findExchanges});
export const useDocumentFinder = queryHook({fetcher: apiClient.findDocuments});
export const usePartnerFinder = queryHook({fetcher: apiClient.findPartners});
export const useMembersFinder = queryHook({fetcher: apiClient.findMembers});
export const useAppVersionFinder = queryHook({fetcher: apiClient.findAppVersion});
export const useAdapterFinder = queryHook({fetcher: apiClient.findAdapters});
export const useMyProfile = queryHook({fetcher: apiClient.getProfile});






