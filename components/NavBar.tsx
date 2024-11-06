"use client";

import {
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@nextui-org/react";
// import { GithubIcon, HeyGenLogo } from "./Icons";
import { ThemeSwitch } from "./ThemeSwitch";
import Image from "next/image";

export default function NavBar() {
  return (
    <Navbar className="w-full mt-4">
      <NavbarBrand style={{display:'flex',flexDirection:'column',gap:'10px',  justifyContent:'center', alignItems:'center',}}>
        <Link isExternal aria-label="codewave" href="https://codewave.com/">
          <Image src={'/Taxease.webp'} alt="Codewave" height={28} width={133} style={{filter:"invert(90%)"}}/>
        </Link>
        <div className="bg-gradient-to-br from-sky-300 to-indigo-500 bg-clip-text ml-4">
          <p className="text-xl font-semibold text-transparent heygen__heading">
            Ask anything about Australia's R&D Tax Incentive Program
          </p>
        </div>
      </NavbarBrand>
      {/* <NavbarContent justify="center">
        <NavbarItem className="flex flex-row items-center gap-4">
          <ThemeSwitch />
        </NavbarItem>
      </NavbarContent> */}
    </Navbar>
  );
}
