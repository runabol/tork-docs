import { Dispatch, Fragment, SetStateAction, useEffect, useState } from 'react'
import Image from 'next/image'
import clsx from 'clsx'
import { Highlight } from 'prism-react-renderer'

import { Button } from '@/components/Button'
import { HeroBackground } from '@/components/HeroBackground'
import blurCyanImage from '@/images/blur-cyan.png'
import blurIndigoImage from '@/images/blur-indigo.png'

interface snippetTab {
  name: string
  code: string
  active: boolean
  setActive: Dispatch<SetStateAction<boolean>>
}

function TrafficLightsIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 42 10" fill="none" {...props}>
      <circle cx="5" cy="5" r="4.5" />
      <circle cx="21" cy="5" r="4.5" />
      <circle cx="37" cy="5" r="4.5" />
    </svg>
  )
}

function createTab(name: string, code: string, active: boolean): snippetTab {
  var [active_, setActive] = useState(active)
  return {
    name: name,
    code: code,
    active: active_,
    setActive: setActive,
  }
}

function bashTab() {
  const code = `name: extract a frame from a video
env:
  SRC: https://example.com/input.mov
  DST: https://example.com/upload/frame.jpg
image: jrottenberg/ffmpeg:3.4-alpine
run: |
  ffmpeg -i $SRC -vframes 1 \\
    -an -s 400x222 -ss 30 /tmp/frame.jpg
  wget --post-file=/tmp/frame.jpg $DST`
  return createTab('Bash', code, true)
}

function pythonTab() {
  const code = `name: Get the post
image: python:3
files:
  script.py: |
    import requests
    url = "https://jsonplaceholder.typicode.com/posts/1"
    response = requests.get(url)
    data = response.json()
    print(data['title'])
run: |
  pip install requests
  python script.py > $TORK_OUTPUT`
  return createTab('Python', code, false)
}

function goTab() {
  const code = `name: a go task
image: golang:alpine3.18
files:
  main.go: |
    package main
    import "fmt"
    func main() {
     fmt.Println("Hello world!")
    }
run: |
  go run main.go > $TORK_OUTPUT
  `
  return createTab('Go', code, false)
}

function sqlTab() {
  const code = `name: count number of employees per department
image: postgres:15
env:
  PGPASSWORD: supersecret
files:
  script.sql: |
    SELECT department, count(*) AS emp_count
    FROM employees
    GROUP BY department
    ORDER BY 2 desc;
run: |
  psql -h mypostgreshost -U me -f script.sql`
  return createTab('SQL', code, false)
}

export function Hero() {
  const tabs = [bashTab(), pythonTab(), sqlTab(), goTab()]
  const [currenTab, setCurrentTab] = useState(tabs[0])
  return (
    <div className="overflow-hidden bg-slate-900 dark:-mb-32 dark:mt-[-4.75rem] dark:pb-32 dark:pt-[4.75rem]">
      <div className="py-16 sm:px-2 lg:relative lg:px-0 lg:py-20">
        <div className="mx-auto grid max-w-2xl grid-cols-1 items-center gap-x-8 gap-y-16 px-4 lg:max-w-8xl lg:grid-cols-2 lg:px-8 xl:gap-x-16 xl:px-12">
          <div className="relative z-10 md:text-center lg:text-left">
            <Image
              className="absolute bottom-full right-full -mb-56 -mr-72 opacity-50"
              src={blurCyanImage}
              alt=""
              width={530}
              height={530}
              unoptimized
              priority
            />
            <div className="relative">
              <p className="inline bg-gradient-to-r from-indigo-200 via-sky-400 to-indigo-200 bg-clip-text font-display text-5xl tracking-tight text-transparent">
                Workflow Automation. Simplified.
              </p>
              <p className="mt-3 text-2xl tracking-tight text-slate-400">
                Creating workflows shouldn't be complicated or restricted to
                engineers; it should be available to everyone in the language
                they feel most comfortable with.
              </p>
              <div className="mt-8 flex gap-4 md:justify-center lg:justify-start">
                <Button href="/#quick-start">Quick Start</Button>
                <Button
                  href="https://github.com/runabol/tork"
                  variant="secondary"
                >
                  View on GitHub
                </Button>
              </div>
            </div>
          </div>
          <div className="relative lg:static xl:pl-10">
            <div className="absolute inset-x-[-50vw] -bottom-48 -top-32 [mask-image:linear-gradient(transparent,white,white)] dark:[mask-image:linear-gradient(transparent,white,transparent)] lg:-bottom-32 lg:-top-32 lg:left-[calc(50%+14rem)] lg:right-0 lg:[mask-image:none] lg:dark:[mask-image:linear-gradient(white,white,transparent)]">
              <HeroBackground className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:left-0 lg:translate-x-0 lg:translate-y-[-60%]" />
            </div>
            <div className="relative">
              <Image
                className="absolute -right-64 -top-64"
                src={blurCyanImage}
                alt=""
                width={530}
                height={530}
                unoptimized
                priority
              />
              <Image
                className="absolute -bottom-40 -right-44"
                src={blurIndigoImage}
                alt=""
                width={567}
                height={567}
                unoptimized
                priority
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-sky-300 via-sky-300/70 to-blue-300 opacity-10 blur-lg" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-sky-300 via-sky-300/70 to-blue-300 opacity-10" />
              <div className="relative rounded-2xl bg-[#0A101F]/80 ring-1 ring-white/10 backdrop-blur">
                <div className="absolute -top-px left-20 right-11 h-px bg-gradient-to-r from-sky-300/0 via-sky-300/70 to-sky-300/0" />
                <div className="absolute -bottom-px left-11 right-20 h-px bg-gradient-to-r from-blue-400/0 via-blue-400 to-blue-400/0" />
                <div className="pl-4 pt-4">
                  <TrafficLightsIcon className="h-2.5 w-auto stroke-slate-500/30" />
                  <div className="mt-4 flex space-x-2 text-xs">
                    {tabs.map((tab) => (
                      <div
                        key={tab.name}
                        onClick={() => {
                          currenTab.setActive(false)
                          tab.setActive(true)
                          setCurrentTab(tab)
                        }}
                        className={clsx(
                          'flex h-6 rounded-full hover:cursor-pointer',
                          tab.active
                            ? 'bg-gradient-to-r from-sky-400/30 via-sky-400 to-sky-400/30 p-px font-medium text-sky-300'
                            : 'text-slate-500',
                        )}
                      >
                        <div
                          className={clsx(
                            'flex items-center rounded-full px-2.5',
                            tab.active && 'bg-slate-800',
                          )}
                        >
                          {tab.name}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex items-start px-1 text-sm">
                    <div
                      aria-hidden="true"
                      className="select-none border-r border-slate-300/5 pr-4 font-mono text-slate-600"
                    >
                      {Array.from({
                        length: currenTab.code.split('\n').length,
                      }).map((_, index) => (
                        <Fragment key={index}>
                          {(index + 1).toString().padStart(2, '0')}
                          <br />
                        </Fragment>
                      ))}
                    </div>
                    <Highlight
                      code={currenTab.code}
                      language={'yaml'}
                      theme={{ plain: {}, styles: [] }}
                    >
                      {({
                        className,
                        style,
                        tokens,
                        getLineProps,
                        getTokenProps,
                      }) => (
                        <pre
                          className={clsx(
                            className,
                            'flex overflow-x-auto pb-6',
                          )}
                          style={style}
                        >
                          <code className="px-4">
                            {tokens.map((line, lineIndex) => (
                              <div key={lineIndex} {...getLineProps({ line })}>
                                {line.map((token, tokenIndex) => (
                                  <span
                                    key={tokenIndex}
                                    {...getTokenProps({ token })}
                                  />
                                ))}
                              </div>
                            ))}
                          </code>
                        </pre>
                      )}
                    </Highlight>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
