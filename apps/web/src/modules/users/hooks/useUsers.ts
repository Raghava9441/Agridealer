import { useQuery } from '@tanstack/react-query'
import { usersApi, usersKeys, type UserListFilter } from '../api/usersApi'

export function useUsers(filter: UserListFilter = {}) {
  return useQuery({
    queryKey: usersKeys.list(filter),
    queryFn: () => usersApi.list(filter),
  })
}
