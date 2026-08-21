import { createSlice } from '@reduxjs/toolkit'
import { login, restoreSession } from './authSlice'
import { appConfig } from '../../bootstrap/config'
import { getTenantSlugFromHostname } from '../../shared/lib/tenant'

export interface TenantState {
  tenantId: string | null
  plan: string | null
  features: string[]
  slug: string | null
  /** Slug implied by the current URL, resolved once at load — independent of login state. */
  hostSlug: string | null
}

const initialState: TenantState = {
  tenantId: null,
  plan: null,
  features: [],
  slug: null,
  hostSlug: getTenantSlugFromHostname(window.location.hostname, appConfig.rootDomain),
}

/**
 * Derived from the same login/restoreSession thunks authSlice reacts to
 * (not a duplicate API call) — kept as its own slice per the spec's
 * Tenant/Theme/Feature-Flags separation, since tenant branding/features are
 * a distinct concern from "who is logged in."
 */
const tenantSlice = createSlice({
  name: 'tenant',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      (action): action is ReturnType<typeof login.fulfilled> | ReturnType<typeof restoreSession.fulfilled> =>
        action.type === login.fulfilled.type || action.type === restoreSession.fulfilled.type,
      (state, action) => {
        const session = action.payload
        if (!session) return
        state.tenantId = session.tenantId
        state.plan = session.tenant.plan
        state.features = session.tenant.features
        state.slug = session.tenant.slug
      },
    )
  },
})

export const tenantReducer = tenantSlice.reducer

export const selectTenant = (state: { tenant: TenantState }) => state.tenant
export const selectTenantFeatures = (state: { tenant: TenantState }) => state.tenant.features
