import React from 'react';
import {
  Text,
  Link
} from "@chakra-ui/react"
import SignIn from './SignIn'
import SignUp from './SignUp'

/**
 * The home page that will be displayed when start the app
 */
export default function Home(): JSX.Element {
  return (
    <>
      <SignIn />
      <Text fontSize='60px' color="green.200" align="center">--or--</Text>
      <SignUp />
      <Text fontSize='15px' pt='5rem' align="center">Source code can be found <Link href="https://github.com/Zechen-Wang/covey.town" isExternal color='blue'>here</Link></Text>
    </>
  )
}
