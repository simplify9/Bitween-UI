import { queryHook} from './queryHookUtil';
import  {apiClient} from "../client";


export const useExchangeFinder = queryHook({ fetcher: apiClient.findExchanges } );
export const useDocumentFinder = queryHook({ fetcher: apiClient.findDocuments } );
export const usePartnerFinder = queryHook({ fetcher: apiClient.findPartners } );
export const useSubscriptionFinder = queryHook({ fetcher: apiClient.findSubscriptions});
export const useAdapterFinder = queryHook({ fetcher: apiClient.findAdapters});






