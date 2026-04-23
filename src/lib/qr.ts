import QRCode from 'qrcode'

export async function generateQrDataUrl(
  participantId: string,
  baseUrl: string
): Promise<string> {
  const url = `${baseUrl}/qr/${participantId}`
  return QRCode.toDataURL(url, {
    width: 256,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
  })
}

export function getQrUrl(participantId: string): string {
  return `/qr/${participantId}`
}
