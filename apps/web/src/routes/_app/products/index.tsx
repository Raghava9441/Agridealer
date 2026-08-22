import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { PageLayout } from '@/shared/components/ui/PageLayout'
import { Button } from '@/shared/components/ui/Button'
import { Dialog } from '@/shared/components/ui/Dialog'
import { ErrorBoundary } from '@/shared/components/ErrorBoundary'
import { ProductTable } from '@/modules/products/components/ProductTable'
import { ProductForm } from '@/modules/products/components/ProductForm'
import { useContent } from '@/cms/useContent'
import { usePermission } from '@/permissions/hooks'

export const Route = createFileRoute('/_app/products/')({
  component: ProductsPage,
})

function ProductsPage() {
  const content = useContent()
  const canCreate = usePermission('products:create')
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <ErrorBoundary>
      <PageLayout
        title={content.get('products.title')}
        description={content.get('products.description')}
        actions={canCreate && <Button onClick={() => setDialogOpen(true)}>{content.get('products.addProduct')}</Button>}
      >
        <ProductTable />
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen} title={content.get('products.addProduct')}>
          <ProductForm onSuccess={() => setDialogOpen(false)} />
        </Dialog>
      </PageLayout>
    </ErrorBoundary>
  )
}
