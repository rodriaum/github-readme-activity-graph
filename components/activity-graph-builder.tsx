"use client"

import { useMemo, useState } from "react"
import { ArrowUpRight, Check, Clipboard, Code2, Github, Palette, SlidersHorizontal, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { themeNames } from "@/lib/themes"
import type { GraphType } from "@/lib/types"

const graphTypes: { value: GraphType; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "playful", label: "Playful" },
  { value: "bar", label: "Bar" },
  { value: "mountain", label: "Mountain" },
  { value: "neon", label: "Neon" },
  { value: "minimal", label: "Minimal" },
  { value: "terminal", label: "Terminal" },
  { value: "gradient", label: "Gradient" }
]

type FormState = {
  username: string
  organization: boolean
  days: string
  theme: string
  type: GraphType
  area: boolean
  grid: boolean
  hideTitle: boolean
  hideBorder: boolean
  customTitle: string
  height: string
  radius: string
  bgColor: string
  borderColor: string
  titleColor: string
  areaColor: string
  color: string
  line: string
  point: string
}

const initial: FormState = {
  username: "rodriaum",
  organization: false,
  days: "31",
  theme: "default",
  type: "default",
  area: false,
  grid: true,
  hideTitle: false,
  hideBorder: false,
  customTitle: "",
  height: "420",
  radius: "0",
  bgColor: "",
  borderColor: "",
  titleColor: "",
  areaColor: "",
  color: "",
  line: "",
  point: ""
}

function toQuery(state: FormState) {
  const params = new URLSearchParams()
  params.set(state.organization ? "organization" : "username", state.username.trim())
  params.set("days", state.days)
  params.set("theme", state.theme)
  params.set("type", state.type)
  params.set("area", String(state.area))
  params.set("grid", String(state.grid))
  params.set("hide_title", String(state.hideTitle))
  params.set("hide_border", String(state.hideBorder))
  params.set("height", state.height)
  params.set("radius", state.radius)
  if (state.customTitle.trim()) params.set("custom_title", state.customTitle.trim())
  for (const key of ["bgColor", "borderColor", "titleColor", "areaColor", "color", "line", "point"] as const) {
    if (state[key]) params.set(({ bgColor: "bg_color", borderColor: "border_color", titleColor: "title_color", areaColor: "area_color", color: "color", line: "line", point: "point" })[key], state[key].replace("#", ""))
  }
  return params.toString()
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-2 text-sm font-medium text-foreground"><span>{label}</span>{children}</label>
}

export function ActivityGraphBuilder() {
  const [form, setForm] = useState(initial)
  const [copied, setCopied] = useState(false)
  const [origin, setOrigin] = useState("")
  const query = useMemo(() => toQuery(form), [form])
  const graphUrl = useMemo(() => `${origin}/graph?${query}`, [origin, query])
  const markdown = `[![${form.username}'s GitHub activity graph](${graphUrl})](https://github.com/${form.username})`

  React.useEffect(() => setOrigin(window.location.origin), [])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(previous => ({ ...previous, [key]: value }))
    setCopied(false)
  }

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-5 pb-16 sm:px-8">
      <header className="flex h-20 items-center justify-between border-b border-border">
        <a href="https://github.com/rodriaum/github-readme-activity-graph" className="flex items-center gap-3 font-semibold tracking-tight">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground"><Github className="size-5" /></span>
          <span>Activity Graph <span className="text-muted-foreground">/ Studio</span></span>
        </a>
        <a href="https://github.com/rodriaum/github-readme-activity-graph" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground">GitHub repository <ArrowUpRight className="size-4" /></a>
      </header>

      <section className="grid gap-8 pb-9 pt-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground"><Sparkles className="size-3.5 text-primary" /> GitHub profile visualization</div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Your activity.<br /><span className="text-muted-foreground">Your style.</span></h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">Build a personalized contribution graph for your GitHub profile. Choose a theme, shape the chart and copy an embed link.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm font-medium"><Code2 className="size-4 text-primary" /> Live endpoint</div>
          <p className="mt-2 truncate font-mono text-xs text-muted-foreground">/graph?username={form.username || "username"}</p>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">SVG output, ready for GitHub README files and websites.</p>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4"><div className="flex items-center gap-2 font-semibold"><SlidersHorizontal className="size-4" /> Customize</div><span className="text-xs text-muted-foreground">Settings</span></div>
          <div className="grid gap-5 p-5">
            <Field label="GitHub account">
              <div className="flex gap-2">
                <Input value={form.username} onChange={event => update("username", event.target.value)} placeholder="username or organization" aria-label="GitHub username or organization" />
                <Select value={form.organization ? "organization" : "user"} onValueChange={value => update("organization", value === "organization")}>
                  <SelectTrigger className="w-[118px]"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="user">User</SelectItem><SelectItem value="organization">Org</SelectItem></SelectContent>
                </Select>
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date range">
                <Select value={form.days} onValueChange={value => update("days", value)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{["7", "14", "31", "45", "60", "90"].map(value => <SelectItem key={value} value={value}>{value} days</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Graph type">
                <Select value={form.type} onValueChange={value => update("type", value as GraphType)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{graphTypes.map(item => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Theme">
              <Select value={form.theme} onValueChange={value => update("theme", value)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{themeNames.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Height"><Input type="number" min="200" max="600" value={form.height} onChange={event => update("height", event.target.value)} /></Field>
              <Field label="Corner radius"><Input type="number" min="0" max="16" value={form.radius} onChange={event => update("radius", event.target.value)} /></Field>
            </div>
            <div className="grid gap-3 rounded-xl border border-border p-4">
              <div className="flex items-center justify-between"><span className="text-sm">Show area</span><Switch checked={form.area} onCheckedChange={value => update("area", value)} /></div>
              <div className="flex items-center justify-between"><span className="text-sm">Show grid</span><Switch checked={form.grid} onCheckedChange={value => update("grid", value)} /></div>
              <div className="flex items-center justify-between"><span className="text-sm">Hide title</span><Switch checked={form.hideTitle} onCheckedChange={value => update("hideTitle", value)} /></div>
              <div className="flex items-center justify-between"><span className="text-sm">Hide border</span><Switch checked={form.hideBorder} onCheckedChange={value => update("hideBorder", value)} /></div>
            </div>
            <details className="group rounded-xl border border-border p-4">
              <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium"><Palette className="size-4" /> Custom colors</summary>
              <div className="mt-4 grid grid-cols-2 gap-4">
                {(["bgColor", "borderColor", "color", "titleColor", "line", "point", "areaColor"] as const).map(key => (
                  <label key={key} className="grid gap-2 text-xs capitalize text-muted-foreground">{({ bgColor: "Background", borderColor: "Border", color: "Labels", titleColor: "Title", line: "Line", point: "Points", areaColor: "Area" })[key]}
                    <Input type="color" className="h-10 p-1" value={form[key] || ({ bgColor: "#ffcfe9", borderColor: "#ffffff", titleColor: "#9e4c98", color: "#9e4c98", line: "#9e4c98", point: "#403d3d", areaColor: "#9e4c98" })[key]} onChange={event => update(key, event.target.value)} />
                  </label>
                ))}
              </div>
            </details>
            <Field label="Custom title"><Input value={form.customTitle} onChange={event => update("customTitle", event.target.value)} placeholder="My contribution graph" maxLength={120} /></Field>
            <Button variant="outline" className="w-full" onClick={() => setForm(initial)}>Reset settings</Button>
          </div>
        </aside>

        <section className="min-w-0 space-y-5">
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div><h2 className="font-semibold">Preview</h2><p className="mt-1 text-xs text-muted-foreground">Updates as you customize</p></div>
              <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground"><span className="size-1.5 rounded-full bg-emerald-500" /> SVG preview</span>
            </div>
            <div className="flex min-h-[330px] items-center justify-center overflow-x-auto bg-[radial-gradient(var(--border)_0.7px,transparent_0.7px)] bg-[size:14px_14px] p-4 sm:p-7">
              {form.username.trim() ? <img key={query} src={`/graph?${query}`} alt="GitHub activity graph preview" className="h-auto w-full min-w-[560px] rounded-lg shadow-sm" /> : <p className="text-sm text-muted-foreground">Enter a GitHub username to preview the graph.</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 font-semibold"><Code2 className="size-4 text-primary" /> Image URL</div>
              <p className="mt-2 text-xs text-muted-foreground">Use this URL as the image source.</p>
              <div className="mt-4 break-all rounded-xl bg-muted p-3 font-mono text-xs leading-5 text-muted-foreground">{graphUrl || `/graph?${query}`}</div>
              <Button className="mt-3 w-full" variant="outline" onClick={() => copy(graphUrl || `/graph?${query}`)}><Clipboard className="size-4" /> Copy URL</Button>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 font-semibold"><Github className="size-4 text-primary" /> Markdown embed</div>
              <p className="mt-2 text-xs text-muted-foreground">Paste this snippet into your profile README.</p>
              <pre className="mt-4 min-h-[92px] overflow-x-auto whitespace-pre-wrap break-all rounded-xl bg-muted p-3 font-mono text-xs leading-5 text-muted-foreground">{markdown}</pre>
              <Button className="mt-3 w-full" variant="outline" onClick={() => copy(markdown)}>{copied ? <Check className="size-4" /> : <Clipboard className="size-4" />}{copied ? "Copied" : "Copy Markdown"}</Button>
            </div>
          </div>
          <p className="px-1 text-xs leading-5 text-muted-foreground">Organization graphs include public repositories only. Private contribution counts are available through the GitHub contribution calendar when enabled in profile settings.</p>
        </section>
      </div>

      <footer className="mt-12 flex flex-col justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row"><span>Open source · Built with Next.js and React</span><a href="https://github.com/rodriaum/github-readme-activity-graph" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-foreground">View source <ArrowUpRight className="size-3" /></a></footer>
    </main>
  )
}
