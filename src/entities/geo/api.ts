import { baseApi } from '@/shared/api'

export interface Geo {
  /** ISO-2, or null when the lookup genuinely could not tell. Never a silent
   *  default — the sign-in screen says which of the two it is. */
  country: string | null
  detected: boolean
}

export const geoApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    // Anonymous, and stable for as long as the network is. Every cache miss
    // may cost an outbound lookup against a third-party quota shared by the
    // whole server, so the answer is held for the session.
    getGeo: b.query<Geo, void>({ query: () => '/geo', keepUnusedDataFor: 3600 }),
  }),
})

export const { useGetGeoQuery } = geoApi
