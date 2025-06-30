import Link from 'next/link'

export function EmailConfirmationHelp() {
  return (
    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-sm text-blue-800">
        <strong>💡 Проблеми з входом?</strong>
      </p>
      <ul className="text-sm text-blue-700 mt-2 space-y-1">
        <li>• Переконайтеся, що ви підтвердили електронну пошту</li>
        <li>• Перевірте папку "Спам" для листа підтвердження</li>
        <li>• Переконайтеся, що пароль введено правильно</li>
        <li>• <Link href="/auth/resend-confirmation" className="underline">Надіслати лист підтвердження повторно</Link></li>
      </ul>
    </div>
  )
}