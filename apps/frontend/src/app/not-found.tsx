import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
        404
      </h1>
      <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
        Trang bạn tìm kiếm không tồn tại.
      </p>
      <Link
        href="/dashboard"
        className="mt-4 rounded-lg px-6 py-3 font-medium text-white transition-colors"
        style={{ background: 'var(--color-primary)' }}
      >
        Về trang chủ
      </Link>
    </div>
  );
}
