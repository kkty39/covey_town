import * as React from "react"
import {
  Text,
  VStack,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  FormControl,
  FormLabel,
  Box,
  Stack,
  useToast,
} from "@chakra-ui/react"
import UsersServiceClient from '../../classes/UsersServiceClient'
import usePlayerName from '../../hooks/usePlayerName';

/**
 * The sign in component which allows users to sign in with their username and password
 */
export default function SignIn(): JSX.Element {
  const [show, setShow] = React.useState(false)
  const handleClick = () => setShow(!show)
  const [userName, setUserName] = React.useState('');
  const [password, setPassword] = React.useState('');
  const toast = useToast();
  const { setName } = usePlayerName();

  const handleLogIn = async () => {
    if (!(userName && password)) {
      toast({
        title: "Sign in failed",
        description: "Please complete all required fields",
        status: "error",
        duration: 3000,
        isClosable: true
      });
      return;
    }
    const userServiceClient = new UsersServiceClient();
    if (!await userServiceClient.findUserByNameAndPassword({userName, password})) {
      toast({
        title: "Sign in failed",
        description: "User account does not exist.",
        status: "error",
        duration: 3000,
        isClosable: true
      });
      return;
    }
    setName(userName);
  }

  return (
    <VStack>
      <Text fontSize='70px' color='tomato' as='em'>Welcome to Covey.Town!</Text>
      <Box p="4" borderRadius='lg' width='lg'>
      <FormControl mb='4rem'>
        <FormLabel fontSize='30px'>Username</FormLabel>
        <Input variant="flushed" value={userName} onChange={(e) => {setUserName(e.target.value)}}/>
        <FormLabel mt='50px' fontSize='30px'>Password</FormLabel>
        <InputGroup>
          <Input type={show ? "text" : "password"} variant="flushed" value={password} onChange={(e) => {setPassword(e.target.value)}}/>
          <InputRightElement width="4rem" pb='10px'>
          <Button onClick={handleClick} size='sm'>{show ? "Hide" : "Show"}</Button></InputRightElement>
        </InputGroup>
        <Stack direction="column" mt='3rem' align='center'>
          <Button colorScheme='teal' size='lg' width='xs' onClick={handleLogIn}>Sign in</Button>
        </Stack>
      </FormControl>
      </Box> 
    </VStack>
  )
}