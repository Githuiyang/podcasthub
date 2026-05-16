'use client'

import Link from 'next/link'
import { STUDIO_SUBMISSION_FORM_URL } from '@/lib/studioSubmission'

const steps = [
  '填写表单 — 按顺序录入录音室名称、地址、设备、价格、联系方式等信息。',
  '整理审核 — 提交后进入飞书结果表，运营人员会删减无效信息、保留有效内容。',
  '确认上线 — 整理完成的数据通过后台同步到线上，确认后立即展示。',
]

export default function SubmitStudioPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 pb-16 animate-fade-in-up">
      <div className="rounded-[32px] border border-black/8 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8">
        <div className="inline-flex rounded-full border border-black/10 bg-black px-3 py-1 text-[11px] font-semibold text-white">
          提交录音室
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">提交我的播客录音室</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          通过飞书表单提交录音室资料。提交后数据进入飞书结果表，运营人员整理确认后同步到线上。
        </p>

        <div className="mt-6 grid gap-4 rounded-3xl border border-black/6 bg-neutral-50 p-5">
          {steps.map((step, index) => (
            <div key={step} className="flex items-start gap-3">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-[11px] font-semibold text-white">
                {index + 1}
              </div>
              <p className="text-sm leading-6 text-slate-600">{step}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href={STUDIO_SUBMISSION_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            打开录音室信息表单
          </a>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
          填写完成后，提交记录会进入飞书结果表等待整理。运营人员会校验信息并确认后同步到线上。如需修改已上线录音室的信息，也可以通过同一表单重新提交。
        </div>

        <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-700">
            返回首页
          </Link>
          <Link href="/studios" className="hover:text-slate-700">
            查看录音室列表
          </Link>
          <Link href="/admin/studios" className="hover:text-slate-700">
            打开管理后台
          </Link>
        </div>
      </div>
    </div>
  )
}
