import React from 'react'
import { Pane, Heading, Button, ButtonProps, Combobox } from 'evergreen-ui'
import Github from '../icon/Github'
import Rust from '../icon/Rust'
import './Navabar.css'
import { getRustRegexDocs, getRustRegexSyntaxDocs } from '../../utils'

export type NavbarProps = {
  rustRegexVersion?: string
  rustRegexSyntaxVersion?: string
}

export default React.memo(function Navbar(props: NavbarProps) {
  return (
    <Pane
      display="flex"
      width="100vw"
      padding="1rem"
      backgroundColor="white"
      elevation={1}
      className="Navbar"
      style={{ position: 'fixed', zIndex: 999 }}
    >
      <Pane flex={1} alignItems="center" display="flex" paddingX="1rem">
        <Heading is="h1" size={500}>
          RUST REGEX PLAYGROUND
          <sup style={{ fontWeight: 300 }}>
            {' '}
            ({props.rustRegexVersion || 'latest'})
          </sup>
        </Heading>
      </Pane>
      <Pane alignItems="center" display="flex">
        <NavbarItem
          iconAfter={Github}
          href="https://github.com/2fd/rust-regex-playground"
          target="_blank"
        >
          PLAYGROUND
        </NavbarItem>
        <NavbarItem
          iconAfter={Rust}
          href={getRustRegexSyntaxDocs(props.rustRegexSyntaxVersion)}
          target="_blank"
        >
          RUST-REGEX-SYNTAX
        </NavbarItem>
        <NavbarItem
          iconAfter={Rust}
          href={getRustRegexDocs(props.rustRegexVersion)}
          target="_blank"
        >
          RUST-REGEX
        </NavbarItem>
      </Pane>
    </Pane>
  )
})

export const NavbarItem = React.memo(function (
  props: Pick<ButtonProps, 'children' | 'iconAfter'> &
    Pick<React.AnchorHTMLAttributes<any>, 'href' | 'rel' | 'target'>
) {
  return (
    <Button
      {...props}
      is={Anchor}
      appearance="minimal"
      intent="none"
      size="medium"
      border="0"
    />
  )
})

const Anchor = React.memo(function (props: any) {
  return <a {...props} />
})
