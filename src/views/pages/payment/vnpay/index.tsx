"use client"

import { Box, Button, Card, Typography, useTheme } from "@mui/material"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import Icon from "src/components/Icon"
import Spinner from "src/components/spinner"
import { ROUTE_CONFIG } from "src/configs/route"
import { getVNPayIpnPayment } from "src/services/payment"
import { formatNumberToLocal } from "src/utils"

const PaymentVNPay = () => {
    const { t } = useTranslation()
    const theme = useTheme()
    const router = useRouter()
    const searchParams = useSearchParams()
    const vnp_SecureHash = searchParams.get('vnp_SecureHash')
    const vnp_ResponseCode = searchParams.get('vnp_ResponseCode')
    const vnp_TxnRef = searchParams.get('vnp_TxnRef')

    // ** State
    const [dataPayment, setDataPayment] = useState({
        status: "",
        totalPrice: 0
    })

    const fetchGetIpnVNPay = async (param: any) => {
        await getVNPayIpnPayment({
            params: {
                ...param
            }
        }).then((res) => {
            const data = res?.data
            if (data) {
                setDataPayment({
                    status: data.RspCode,
                    totalPrice: data.totalPrice,
                })
            }
        })
    }

    useEffect(() => {
        if (vnp_SecureHash && vnp_ResponseCode && vnp_TxnRef) {
            fetchGetIpnVNPay({ vnp_ResponseCode, vnp_SecureHash, orderId: vnp_TxnRef, vnp_TxnRef })
        }
    }, [vnp_SecureHash, vnp_ResponseCode, vnp_TxnRef])

    return (
        <>
            {!dataPayment.status && <Spinner />}
            <Card sx={{ padding: "20px" }}>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Typography sx={{ fontSize: '26px', fontWeight: 600, color: theme.palette.primary.main }}>
                        {formatNumberToLocal(dataPayment?.totalPrice)} VND
                    </Typography>

                </Box>
                {dataPayment.status && (
                    <>
                        {dataPayment.status === "00" ? (
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>

                                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: "20px" }}>
                                    <Icon icon='ep:success-filled' fontSize={80} color={theme.palette.success.main} />
                                </Box>
                                <Typography sx={{ fontWeight: "bold", fontSize: "24px" }}>{t("Payment_success")}</Typography>
                            </Box >
                        ) : (
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>

                                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: "20px" }}>
                                    <Icon icon='ep:warning' fontSize={80} color={theme.palette.warning.main} />
                                </Box>
                                <Typography sx={{ fontWeight: "bold", fontSize: "24px" }}>{t("Payment_error")}</Typography>
                            </Box >
                        )}
                    </>
                )}
                <Box sx={{ display: "flex", justifyContent: "center", width: "100%", mt: 4 }}>
                    <Button variant="contained" onClick={() => router.push(ROUTE_CONFIG.HOME)}>{t("Back_home")}</Button>
                </Box>
            </Card>
        </>
    )
}

export default PaymentVNPay