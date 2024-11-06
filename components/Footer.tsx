import Link from 'next/link'
import React from 'react'

const Footer = () => {
  return (
    <div style={{width:"100%", display:'flex', justifyContent:'center', alignItems:'center', marginBottom:'10px'}}>Powered by&nbsp;<Link href="https://codewave.com/" target='_blank'> Codewave</Link></div>
  )
}

export default Footer