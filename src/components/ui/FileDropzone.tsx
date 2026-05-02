'use client'

import { useRef, useState } from 'react'

interface FileDropzoneProps {
  onFile: (file: File) => void
  file?: File | null
  accept?: string
  maxSizeMB?: number
  hint?: string
  onError?: (msg: string) => void
}

export function FileDropzone({
  onFile,
  file,
  accept = 'application/pdf',
  maxSizeMB = 10,
  hint,
  onError,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  function validate(f: File): string | null {
    if (accept && !f.type.startsWith(accept.replace('/*', ''))) {
      return `Нужен ${accept.includes('pdf') ? 'PDF' : accept}-файл.`
    }
    if (f.size > maxSizeMB * 1024 * 1024) {
      return `Файл слишком большой. Максимум — ${maxSizeMB} МБ.`
    }
    return null
  }

  function handleFile(f: File) {
    const err = validate(f)
    if (err) {
      onError?.(err)
      return
    }
    onFile(f)
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Загрузить файл"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`w-full border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors select-none ${
        dragOver ? 'border-primary bg-primary-light' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
      }`}
    >
      <div className="flex justify-center mb-3 text-gray-400" aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M18 4H8a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V12L18 4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M18 4v8h8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M12 17h8M12 21h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      {file ? (
        <div>
          <p className="text-sm font-medium text-gray-900">{file.name}</p>
          <p className="text-xs text-gray-400 mt-1">{(file.size / 1024).toFixed(0)} КБ · нажмите, чтобы заменить</p>
        </div>
      ) : (
        <div>
          <p className="text-sm font-medium text-gray-700">Перетащите PDF или нажмите для выбора</p>
          <p className="text-xs text-gray-400 mt-1">
            {hint ?? `Поддерживается: PDF до ${maxSizeMB} МБ`}
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
    </div>
  )
}
