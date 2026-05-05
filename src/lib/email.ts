/**
 * Transactional email sending for ALTEKO.
 * Uses nodemailer with the same EMAIL_SERVER_* env vars as NextAuth magic links.
 */

import nodemailer from 'nodemailer'

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST ?? 'localhost',
    port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
    secure: Number(process.env.EMAIL_SERVER_PORT ?? 587) === 465,
    auth: process.env.EMAIL_SERVER_USER
      ? {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        }
      : undefined,
  })
}

const FROM = process.env.EMAIL_FROM ?? 'ALTEKO <noreply@alteko.lv>'

function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!local || !domain) return email
  if (local.length <= 2) return `${local[0]}***@${domain}`
  return `${local[0]}${local[1]}***@${domain}`
}

function buildReportEmailHtml(
  lang: 'LV' | 'RU',
  meta: { orderId: string; address: string; cadastralCode: string; statusUrl: string; buildingUrl: string }
): string {
  const isLv = lang === 'LV'
  const orderId8 = meta.orderId.slice(-8).toUpperCase()

  if (isLv) {
    return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
  <h2 style="color:#1d4ed8">Jūsu Gatavības atskaite ir pievienota</h2>
  <p>Cienītais klient,</p>
  <p>Jūsu mājas gatavības atskaite ir gatava. Tā ir pievienota šim e-pastam kā PDF fails.</p>
  <p><strong>Māja:</strong> ${meta.address}</p>
  <p><strong>Pasūtījuma nr.:</strong> ${orderId8}</p>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
  <p>
    <a href="${meta.statusUrl}" style="background:#1d4ed8;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">
      Apskatīt pasūtījumu →
    </a>
  </p>
  <p style="margin-top:16px">
    <a href="${meta.buildingUrl}" style="color:#1d4ed8">Skatīt mājas karti →</a>
  </p>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
  <p style="font-size:12px;color:#6b7280">
    ALTEKO — Mājas gatavības platforma · <a href="https://alteko.lv" style="color:#6b7280">alteko.lv</a>
  </p>
</div>`
  }

  return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
  <h2 style="color:#1d4ed8">Ваш Отчёт о готовности прикреплён</h2>
  <p>Уважаемый клиент,</p>
  <p>Отчёт о готовности вашего дома готов. Он прикреплён к этому письму в формате PDF.</p>
  <p><strong>Адрес:</strong> ${meta.address}</p>
  <p><strong>Номер заказа:</strong> ${orderId8}</p>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
  <p>
    <a href="${meta.statusUrl}" style="background:#1d4ed8;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">
      Просмотреть заказ →
    </a>
  </p>
  <p style="margin-top:16px">
    <a href="${meta.buildingUrl}" style="color:#1d4ed8">Карточка дома →</a>
  </p>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
  <p style="font-size:12px;color:#6b7280">
    ALTEKO — Mājas gatavības platforma · <a href="https://alteko.lv" style="color:#6b7280">alteko.lv</a>
  </p>
</div>`
}

export async function sendReportEmail(
  to: string,
  lang: 'LV' | 'RU',
  pdfBuffer: Buffer,
  meta: { orderId: string; address: string; cadastralCode: string; amountEur: number }
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://alteko.lv'
  const locale = lang === 'RU' ? '/ru' : ''
  const orderId8 = meta.orderId.slice(-8).toUpperCase()
  const statusUrl = `${baseUrl}${locale}/readiness-report/order/${meta.orderId}`
  const buildingUrl = `${baseUrl}${locale}/building/${meta.cadastralCode}`

  const subject =
    lang === 'LV'
      ? `Jūsu Gatavības atskaite — ALTEKO (nr. ${orderId8})`
      : `Ваш Отчёт о готовности — ALTEKO (№ ${orderId8})`

  const transporter = getTransporter()
  await transporter.sendMail({
    from: FROM,
    to,
    subject,
    html: buildReportEmailHtml(lang, { orderId: meta.orderId, address: meta.address, cadastralCode: meta.cadastralCode, statusUrl, buildingUrl }),
    attachments: [
      {
        filename: `gatavibas-atskaite-${orderId8}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  })
}

export async function sendAdminNewOrderNotification(
  orderId: string,
  customerEmail: string,
  amountEur: number,
  address: string
): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) return

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://alteko.lv'
  const orderId8 = orderId.slice(-8).toUpperCase()

  const transporter = getTransporter()
  await transporter.sendMail({
    from: FROM,
    to: adminEmail,
    subject: `[ALTEKO] New Readiness Report order — €${amountEur} from ${maskEmail(customerEmail)}`,
    text: [
      `New Readiness Report order received.`,
      ``,
      `Order ID: ${orderId}`,
      `Short ref: ${orderId8}`,
      `Customer: ${customerEmail}`,
      `Amount: €${amountEur}`,
      `Building: ${address}`,
      ``,
      `To mark as paid after receiving bank transfer:`,
      `POST ${baseUrl}/api/readiness-report/${orderId}/mark-paid`,
      `(requires PLATFORM_ADMIN session)`,
    ].join('\n'),
  })
}
