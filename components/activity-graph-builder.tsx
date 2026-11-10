"use client"

import {useEffect, useMemo, useRef, useState} from "react"
import {ArrowUpRight, Check, Clipboard, Code2, GitBranch, Palette, SlidersHorizontal} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Skeleton} from "@/components/ui/skeleton"
import {Input} from "@/components/ui/input"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Switch} from "@/components/ui/switch"
import {themeNames} from "@/lib/themes"
import {graphStyleNames, graphStyles} from "@/lib/graph-styles"
import type {GraphType} from "@/lib/types"
import Image from "next/image";

const themeLabels: Record<string, string> = {
    github: "GitHub",
    shadcn: "shadcn",
    xcode: "Xcode",
    vue: "Vue",
    nightowl: "Night Owl",
    synthwave: "Synthwave",
    high: "High",
    contrast: "Contrast",
    modern: "Modern",
    lilac: "Lilac"
}

function formatThemeLabel(name: string) {
    return name
        .split("-")
        .map(part => themeLabels[part] ?? `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
        .join(" ")
}

type FormState = {
    username: string
    organization: boolean
    days: string
    theme: string
    type: GraphType
    area: boolean
    grid: boolean
    showPoint: boolean
    hideTitle: boolean
    hideYAxis: boolean
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
    showPoint: true,
    hideTitle: false,
    hideYAxis: false,
    hideBorder: true,
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
    params.set("show_point", String(state.showPoint))
    params.set("hide_title", String(state.hideTitle))
    params.set("hide_y_axis", String(state.hideYAxis))
    params.set("hide_border", String(state.hideBorder))
    params.set("height", state.height)
    params.set("radius", state.radius)
    if (state.customTitle.trim()) params.set("custom_title", state.customTitle.trim())
    for (const key of ["bgColor", "borderColor", "titleColor", "areaColor", "color", "line", "point"] as const) {
        if (state[key]) params.set(({
            bgColor: "bg_color",
            borderColor: "border_color",
            titleColor: "title_color",
            areaColor: "area_color",
            color: "color",
            line: "line",
            point: "point"
        })[key], state[key].replace("#", ""))
    }
    return params.toString()
}

function Field({label, children}: { label: string; children: React.ReactNode }) {
    return <label className="grid gap-2 text-sm font-medium text-foreground"><span>{label}</span>{children}</label>
}

export function ActivityGraphBuilder() {
    const [form, setForm] = useState(initial)
    const [previewForm, setPreviewForm] = useState(initial)
    const previewTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
    const [copiedAction, setCopiedAction] = useState<"url" | "markdown" | null>(null)
    const copyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
    const [origin, setOrigin] = useState("")
    const [isPreviewLoading, setIsPreviewLoading] = useState(true)
    const query = useMemo(() => toQuery(form), [form])
    const previewQuery = useMemo(() => toQuery(previewForm), [previewForm])
    const graphUrl = useMemo(() => `${origin}/graph?${query}`, [origin, query])
    const markdown = `[![${form.username}'s GitHub activity graph](${graphUrl})](https://github.com/${form.username})`

    useEffect(() => setOrigin(window.location.origin), [])

    useEffect(() => {
        setIsPreviewLoading(Boolean(previewForm.username.trim()))
    }, [previewQuery, previewForm.username])

    useEffect(() => {
        return () => {
            if (copyTimeout.current) clearTimeout(copyTimeout.current)
            if (previewTimeout.current) clearTimeout(previewTimeout.current)
        }
    }, [])

    function update<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm(previous => {
            const next = {...previous, [key]: value}
            if (previewTimeout.current) clearTimeout(previewTimeout.current)
            previewTimeout.current = setTimeout(() => {
                setPreviewForm(next)
                previewTimeout.current = null
            }, 500)
            return next
        })
        setCopiedAction(null)
        if (copyTimeout.current) clearTimeout(copyTimeout.current)
    }

    async function copy(value: string, action: "url" | "markdown") {
        try {
            await navigator.clipboard.writeText(value)
            setCopiedAction(action)
            if (copyTimeout.current) clearTimeout(copyTimeout.current)
            copyTimeout.current = setTimeout(() => {
                setCopiedAction(null)
                copyTimeout.current = null
            }, 1800)
        } catch {
            setCopiedAction(null)
            if (copyTimeout.current) clearTimeout(copyTimeout.current)
            copyTimeout.current = null
        }
    }

    return (
        <main className="mx-auto w-full max-w-7xl px-5 pb-16 sm:px-8">
            <header className="flex h-20 items-center justify-between border-b border-border">
                <a href="https://github.com/rodriaum/github-readme-activity-graph"
                   className="flex items-center gap-3 font-semibold tracking-tight">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl">
                        <Image
                            src="/logo.svg"
                            alt="Activity Graph"
                            width={64}
                            height={64}
                            className="size-10 object-contain"
                            priority
                        />
                    </span>
                    <span>Activity Graph <span className="text-muted-foreground">/ Studio</span></span>
                </a>
                <a href="https://github.com/rodriaum/github-readme-activity-graph" target="_blank" rel="noreferrer"
                   className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground">GitHub
                    repository <ArrowUpRight className="size-4"/></a>
            </header>

            <section className="grid gap-8 pb-9 pt-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
                <div className="max-w-3xl">
                    <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Your activity.<br/><span
                        className="text-muted-foreground">Your style.</span></h1>
                    <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">Build a personalized
                        contribution graph for your GitHub profile. Choose a theme, shape the chart and copy an embed
                        link.</p>
                </div>
            </section>

            <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
                <aside className="rounded-2xl border border-border bg-card">
                    <div className="flex items-center justify-between border-b border-border px-5 py-4">
                        <div className="flex items-center gap-2 font-semibold"><SlidersHorizontal
                            className="size-4"/> Customize
                        </div>
                        <span className="text-xs text-muted-foreground">Settings</span></div>
                    <div className="grid gap-5 p-5">
                        <div className="grid grid-cols-[minmax(0,1fr)_132px] gap-3">
                            <Field label={form.organization ? "Organization" : "User"}>
                                <Input
                                    value={form.username}
                                    onChange={event => update("username", event.target.value)}
                                    placeholder={form.organization ? "organization name" : "GitHub username"}
                                    aria-label={form.organization ? "GitHub organization" : "GitHub username"}
                                />
                            </Field>
                            <Field label="Account type">
                                <Select value={form.organization ? "organization" : "user"}
                                        onValueChange={value => { if (value !== null) update("organization", value === "organization") }}>
                                    <SelectTrigger className="w-full"><SelectValue>{form.organization ? "Organization" : "User"}</SelectValue></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="organization" disabled>Organization</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Date range">
                                <Select value={form.days} onValueChange={value => { if (value !== null) update("days", value) }}>
                                    <SelectTrigger className="w-full"><SelectValue>{form.days} days</SelectValue></SelectTrigger>
                                    <SelectContent>{["7", "14", "31", "45", "60", "90"].map(value => <SelectItem
                                        key={value} value={value}>{value} days</SelectItem>)}</SelectContent>
                                </Select>
                            </Field>
                            <Field label="Graph type">
                                <Select value={form.type} onValueChange={value => { if (value !== null) update("type", value as GraphType) }}>
                                    <SelectTrigger className="w-full"><SelectValue>{graphStyles[form.type].label}</SelectValue></SelectTrigger>
                                    <SelectContent>{graphStyleNames.map(value => <SelectItem key={value}
                                                                                       value={value}>{graphStyles[value].label}</SelectItem>)}</SelectContent>
                                </Select>
                            </Field>
                        </div>
                        <Field label="Theme">
                            <Select value={form.theme} onValueChange={value => { if (value !== null) update("theme", value) }}>
                                <SelectTrigger className="w-full"><SelectValue>{formatThemeLabel(form.theme)}</SelectValue></SelectTrigger>
                                <SelectContent>{themeNames.map(name => <SelectItem key={name}
                                                                                   value={name}>{formatThemeLabel(name)}</SelectItem>)}</SelectContent>
                            </Select>
                        </Field>
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Height"><Input type="number" min="200" max="600" value={form.height}
                                                         onChange={event => update("height", event.target.value)}/></Field>
                            <Field label="Corner radius"><Input type="number" min="0" max="16" value={form.radius}
                                                                onChange={event => update("radius", event.target.value)}/></Field>
                        </div>
                        <div className="grid gap-3 rounded-xl border border-border p-4">
                            <div className="flex items-center justify-between"><span
                                className="text-sm">Show area</span><Switch checked={form.area}
                                                                            onCheckedChange={value => update("area", value)}/>
                            </div>
                            <div className="flex items-center justify-between"><span
                                className="text-sm">Show grid</span><Switch checked={form.grid}
                                                                            onCheckedChange={value => update("grid", value)}/>
                            </div>
                            <div className="flex items-center justify-between"><span
                                className="text-sm">Show point</span><Switch checked={form.showPoint}
                                                                             onCheckedChange={value => update("showPoint", value)}/>
                            </div>
                            <div className="flex items-center justify-between"><span
                                className="text-sm">Hide title</span><Switch checked={form.hideTitle}
                                                                             onCheckedChange={value => update("hideTitle", value)}/>
                            </div>
                            <div className="flex items-center justify-between"><span
                                className="text-sm">Hide contribution counts</span><Switch checked={form.hideYAxis}
                                                                             onCheckedChange={value => update("hideYAxis", value)}/>
                            </div>
                            <div className="flex items-center justify-between"><span
                                className="text-sm">Hide border</span><Switch checked={form.hideBorder}
                                                                              onCheckedChange={value => update("hideBorder", value)}/>
                            </div>
                        </div>
                        <details className="group rounded-xl border border-border p-4">
                            <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium">
                                <Palette className="size-4"/> Custom colors
                            </summary>
                            <div className="mt-4 grid grid-cols-2 gap-4">
                                {(["bgColor", "borderColor", "color", "titleColor", "line", "point", "areaColor"] as const).map(key => (
                                    <label key={key} className="grid gap-2 text-xs capitalize text-muted-foreground">{({
                                        bgColor: "Background",
                                        borderColor: "Border",
                                        color: "Labels",
                                        titleColor: "Title",
                                        line: "Line",
                                        point: "Points",
                                        areaColor: "Area"
                                    })[key]}
                                        <Input type="color" className="h-10 w-full cursor-pointer overflow-hidden rounded-md border border-input bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-[inherit] [&::-webkit-color-swatch]:border-0 [&::-moz-color-swatch]:rounded-[inherit] [&::-moz-color-swatch]:border-0" value={form[key] || ({
                                            bgColor: "#ffcfe9",
                                            borderColor: "#ffffff",
                                            titleColor: "#9e4c98",
                                            color: "#9e4c98",
                                            line: "#9e4c98",
                                            point: "#403d3d",
                                            areaColor: "#9e4c98"
                                        })[key]} onChange={event => update(key, event.target.value)}/>
                                    </label>
                                ))}
                            </div>
                        </details>
                        <Field label="Custom title"><Input value={form.customTitle}
                                                           onChange={event => update("customTitle", event.target.value)}
                                                           placeholder="My contribution graph" maxLength={120}/></Field>
                        <Button variant="outline" className="w-full" onClick={() => {
                                if (previewTimeout.current) clearTimeout(previewTimeout.current)
                                previewTimeout.current = null
                                setForm(initial)
                                setPreviewForm(initial)
                            }}>Reset
                            settings</Button>
                    </div>
                </aside>

                <section className="min-w-0 space-y-5">
                    <div className="overflow-hidden rounded-2xl border border-border bg-card">
                        <div
                            className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
                            <div><h2 className="font-semibold">Preview</h2></div>
                        </div>
                        <div
                            className="flex min-h-[330px] items-center justify-center overflow-x-auto bg-[radial-gradient(var(--border)_0.7px,transparent_0.7px)] bg-[size:14px_14px] p-4 sm:p-7">
                            {form.username.trim() ?
                                <div className="relative w-full min-w-[560px]">
                                    {isPreviewLoading && <Skeleton className="h-[260px] w-full rounded-lg"/>}
                                    <img
                                        key={previewQuery}
                                        src={`/graph?${previewQuery}`}
                                        alt="GitHub activity graph preview"
                                        onLoad={() => setIsPreviewLoading(false)}
                                        onError={() => setIsPreviewLoading(false)}
                                        className={`h-auto w-full rounded-lg shadow-sm ${isPreviewLoading ? "hidden" : "block"}`}
                                    />
                                </div> :
                                <p className="text-sm text-muted-foreground">Enter a GitHub username to preview the
                                    graph.</p>}
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-5">
                            <div className="flex items-center gap-2 font-semibold"><Code2
                                className="size-4 text-primary"/> Image URL
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">Use this URL as the image source.</p>
                            <div
                                className="mt-4 h-[120px] overflow-auto break-all rounded-xl bg-muted p-3 font-mono text-xs leading-5 text-muted-foreground">{graphUrl || `/graph?${query}`}</div>
                            <Button className="mx-auto mt-3 flex w-full max-w-[240px] justify-center" variant="outline"
                                    onClick={() => copy(graphUrl || `/graph?${query}`, "url")}>{copiedAction === "url" ?
                                <Check className="size-4"/> : <Clipboard
                                    className="size-4"/>}{copiedAction === "url" ? "Copied" : "Copy URL"}</Button>
                        </div>
                        <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-5">
                            <div className="flex items-center gap-2 font-semibold"><GitBranch
                                className="size-4 text-primary"/> Markdown embed
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">Paste this snippet into your profile
                                README.</p>
                            <pre
                                className="mt-4 h-[120px] overflow-auto whitespace-pre-wrap break-all rounded-xl bg-muted p-3 font-mono text-xs leading-5 text-muted-foreground">{markdown}</pre>
                            <Button className="mx-auto mt-3 flex w-full max-w-[240px] justify-center" variant="outline"
                                    onClick={() => copy(markdown, "markdown")}>{copiedAction === "markdown" ?
                                <Check className="size-4"/> : <Clipboard
                                    className="size-4"/>}{copiedAction === "markdown" ? "Copied" : "Copy Markdown"}</Button>
                        </div>
                    </div>
                    <p className="px-1 text-xs leading-5 text-muted-foreground">Organization graphs include public
                        repositories only. Private contribution counts are available through the GitHub contribution
                        calendar when enabled in profile settings.</p>
                </section>
            </div>

            <footer
                className="mt-12 flex flex-col justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
                <span>Open source · Built with Next.js and React</span><a
                href="https://github.com/rodriaum/github-readme-activity-graph" target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-foreground">View source <ArrowUpRight
                className="size-3"/></a></footer>
        </main>
    )
}
