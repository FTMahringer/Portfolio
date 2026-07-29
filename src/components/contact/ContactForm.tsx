"use client";

import { useState, useRef } from "react";
import { MarkdownEditor } from "@/components/ui/MarkdownEditor";
import { useTranslations } from "@/context/TranslationContext";

type Status = "idle" | "sending" | "success" | "error";

export function ContactForm() {
  const { t } = useTranslations();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("subject", subject);
    formData.append("message", message);
    if (files) {
      Array.from(files).forEach((f) => formData.append("files", f));
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setStatus("success");
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
        setFiles(null);
        if (fileRef.current) fileRef.current.value = "";
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error ?? t('public.contact.form.errors.generic', 'Something went wrong. Please try again.'));
        setStatus("error");
      }
    } catch {
      setErrorMsg(t('public.contact.form.errors.network', 'Network error. Please try again.'));
      setStatus("error");
    }
  }

  return (
    <div className="flex-1 min-w-0">
      <h2 className="text-xl font-bold text-[var(--foreground)] mb-1">
        {t('public.contact.form.heading', 'Send a Message')}
      </h2>
      <p className="text-sm text-[var(--muted)] mb-6">
        {t('public.contact.form.intro', "I'll get back to you as soon as I can.")}
      </p>

      {status === "success" ? (
        <div className="border border-green-700 bg-green-900/20 rounded-lg p-6 text-center">
          <div className="text-2xl mb-2">✅</div>
          <p className="text-green-400 font-medium">{t('public.contact.form.success', 'Message sent!')}</p>
          <p className="text-sm text-[var(--muted)] mt-1">
            {t('public.contact.form.successReplyPrefix', "I'll reply to")} {email} {t('public.contact.form.successReplySuffix', 'shortly.')}
          </p>
          <button
            onClick={() => setStatus("idle")}
            className="mt-4 text-sm text-[var(--accent)] hover:underline cursor-pointer"
          >
            {t('public.contact.form.another', 'Send another')}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                {t('public.contact.form.fields.name', 'Name')} *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('public.contact.form.placeholders.name', 'Your name')}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                {t('public.contact.form.fields.email', 'Email')} *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('public.contact.form.placeholders.email', 'your@email.com')}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--muted)] mb-1">
              {t('public.contact.form.fields.subject', 'Subject')} *
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t('public.contact.form.placeholders.subject', "What's this about?")}
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>

          {/* Markdown editor */}
          <MarkdownEditor
            value={message}
            onChange={setMessage}
            basic
            placeholder={t('public.contact.form.placeholders.message', 'Your message...')}
          />

          {/* File upload */}
          <div>
            <label className="block text-xs font-medium text-[var(--muted)] mb-1">
              {t('public.contact.form.fields.attachments', 'Attachments (optional, max 10 MB total)')}
            </label>
            <input
              ref={fileRef}
              type="file"
              multiple
              onChange={(e) => setFiles(e.target.files)}
              className="block w-full text-sm text-[var(--muted)] file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:border-[var(--border)] file:bg-[var(--card)] file:text-[var(--foreground)] file:text-xs file:cursor-pointer hover:file:border-[var(--accent)] transition-colors cursor-pointer"
            />
          </div>

          {status === "error" && (
            <p className="text-red-400 text-sm">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full py-2.5 px-4 rounded-md bg-[var(--accent)] text-white font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
          >
            {status === "sending" ? t('public.contact.form.actions.sending', 'Sending…') : t('public.contact.form.actions.send', 'Send Message →')}
          </button>
        </form>
      )}
    </div>
  );
}
