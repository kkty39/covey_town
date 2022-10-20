import * as React from "react"
import {
  Input,
  Button,
  FormControl,
  FormLabel,
  Select,
  NumberInput,
  NumberInputField,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast
} from "@chakra-ui/react";
import usePlayerName from '../../hooks/usePlayerName';
import UsersServiceClient from '../../classes/UsersServiceClient'

/**
 * The profile component which allows users to update their accounts, including password, email, gender, age and city
 */
export default function Profile(): JSX.Element {

  const userName = usePlayerName().name;
  const [password, setPassword] = React.useState('');
  const [passwordToMatch, setPasswordToMatch] = React.useState('');
  const [invalid, setInvalid] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [gender, setGender] = React.useState('');
  const [age, setAge] = React.useState('');
  const [city, setCity] = React.useState('');
  const toast = useToast();
  const {isOpen, onOpen, onClose} = useDisclosure();

  const userServiceClient = React.useMemo(() =>
    new UsersServiceClient()
  , []);

  /**
   * Render up-to-date user infomation
   */
  const userInfomation = React.useCallback(() => {
    userServiceClient.findUserByName(userName).then((updateResponse) => {
      setPassword(updateResponse.password);
      setEmail(updateResponse.email);
      setGender(updateResponse.gender);
      setAge(updateResponse.age);
      setCity(updateResponse.city);
    })
  },[userName, userServiceClient]);

  /**
   * Ensure password matches
   */
  React.useEffect(() => {
    if (passwordToMatch && password !== passwordToMatch) {
      setInvalid(true);
    } else {
      setInvalid(false);
    }
  }, [passwordToMatch, password])

  const handleProfile = async() => {
    onOpen();
    userInfomation();
  }

  const handleChange = () => {
    if (!(password && passwordToMatch)) {
      toast({
        title: "Edit failed",
        description: "Please complete all required fields",
        status: "error",
        duration: 3000,
        isClosable: true
      });
      return;
    }
    if (invalid === true) {
      toast({
        title: "Edit failed",
        description: "Password does not match",
        status: "error",
        duration: 3000,
        isClosable: true
      });
      return;
    }
    userServiceClient.updateUser({userName, password, email, gender, age, city});
    onClose();
  }

  return (
    <>
    <Button onClick={handleProfile} colorScheme="pink">Edit profile</Button>
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay/>
      <ModalContent>
        <ModalHeader>Edit your profile</ModalHeader>
        <ModalCloseButton/>
        <form onSubmit={(ev)=>{ev.preventDefault(); handleChange()}}>
          <ModalBody pb={6}>
          <FormControl mb='1rem' isRequired>
        <FormLabel fontSize='20px'>Username</FormLabel>
        <Input value={userName} isReadOnly />
      </FormControl>
      <FormControl mb='1rem' isRequired>
        <FormLabel fontSize='20px'>Password</FormLabel>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
      </FormControl>
      <FormControl mb='1rem' isRequired>
        <FormLabel fontSize='20px'>Re-enter Password</FormLabel>
        <Input type="password" value={passwordToMatch} onChange={(e) => setPasswordToMatch(e.target.value)} isInvalid={invalid}/>
      </FormControl>
      <FormControl mb='1rem'>
        <FormLabel fontSize='20px'>Email</FormLabel>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
      </FormControl>
      <FormControl mb='1rem'>
        <FormLabel fontSize='20px'>Gender</FormLabel>
        <Select placeholder="Select gender" value={gender} onChange={(e) => setGender(e.target.value)}>
          <option>Male</option>
          <option>Female</option>
          <option>Prefer not to say</option>
        </Select>
      </FormControl>
      <FormControl mb='1rem'>
        <FormLabel fontSize='20px'>Age</FormLabel>
        <NumberInput value={age} onChange={(s) => setAge(s)}><NumberInputField/></NumberInput>
      </FormControl>
      <FormControl mb='1rem'>
        <FormLabel fontSize='20px'>City</FormLabel>
        <Input value={city} onChange={(e) => setCity(e.target.value)}/>
      </FormControl>       
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleChange}>
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
    </>
    
  )
}