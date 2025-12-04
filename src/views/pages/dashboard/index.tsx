'use client'

// ** React
import { useEffect, useState } from 'react'

// ** Components
import Spinner from 'src/components/spinner'

// ** Mui
import { Box, Grid } from '@mui/material'

// ** Services
import {
  getCountAllRecords,
  getCountOrderStatus,
  getCountProductStatus,
  getCountProductTypes,
  getCountRevenueYear,
  getCountUserType
} from 'src/services/report'
import CardCountRecords from 'src/views/pages/dashboard/components/CardCountRecords'
import CardProductType from 'src/views/pages/dashboard/components/CardProductType'
import CardCountRevenue from 'src/views/pages/dashboard/components/CardCountRevenue'
import CardCountUserType from 'src/views/pages/dashboard/components/CardCountUserType'
import CardCountOrderStatus from 'src/views/pages/dashboard/components/CardCountStatusOrder'
import { getAllProducts } from 'src/services/product'
import CardProductPopular from 'src/views/pages/dashboard/components/CardProductPopular'

export interface TCountProductType {
  typeName: string
  total: number
}

export interface TCountRevenue {
  year: string
  month: string
  total: number
}

export interface TProductPopular {
  name: string
  price: string
  imageUrl?: string
  thumbnailUrl?: string
  slug: string
  _id: string
  type: {
    name: string
  }
}

const Dashboard = () => {
  const [loading, setLoading] = useState(false)
  const [countRecords, setCountRecords] = useState<Record<string, number>>({})
  const [countProductTypes, setCountProductTypes] = useState<TCountProductType[]>([])
  const [countRevenues, setCountRevenues] = useState<TCountRevenue[]>([])
  const [countUserType, setCountUserType] = useState<Record<number, number>>({} as any)
  const [countOrderStatus, setCountOrderStatus] = useState<Record<number, number>>({} as any)
  const [listProductPopular, setListProductPopular] = useState<TProductPopular[]>([])

  // ** Fetch API - Gọi song song tất cả API để tối ưu performance
  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [countRecordsRes, productTypesRes, revenuesRes, userTypeRes, orderStatusRes, productPopularRes] =
        await Promise.all([
          getCountAllRecords(),
          getCountProductTypes(),
          getCountRevenueYear(),
          getCountUserType(),
          getCountOrderStatus(),
          getAllProducts({ params: { limit: 5, page: 1, order: 'sold desc' } })
        ])

      // Set state sau khi tất cả API hoàn thành
      setCountRecords(countRecordsRes?.data || {})
      setCountProductTypes(productTypesRes?.data || [])
      setCountRevenues(revenuesRes?.data || [])
      setCountUserType(userTypeRes?.data?.data || {})
      setCountOrderStatus(orderStatusRes?.data?.data || {})
      setListProductPopular(productPopularRes?.data?.products || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  return (
    <Box>
      {loading && <Spinner />}
      <CardCountRecords data={countRecords} />
      <Grid container spacing={6}>
        <Grid item md={6} xs={12}>
          <CardProductType data={countProductTypes} />
        </Grid>
        <Grid item md={6} xs={12}>
          <CardCountRevenue data={countRevenues} />
        </Grid>
        <Grid item md={4} xs={12}>
          <CardProductPopular data={listProductPopular} />
        </Grid>
        <Grid item md={4} xs={12}>
          <CardCountUserType data={countUserType} />
        </Grid>
        <Grid item md={4} xs={12}>
          <CardCountOrderStatus data={countOrderStatus} />
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard
