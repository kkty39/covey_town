import React, {useCallback, useEffect, useState} from 'react';
import {
    ListItem,
    Stack,
    Text,
    UnorderedList,
    Button,
    useToast,
  } from "@chakra-ui/react"
import useCoveyAppState from '../../hooks/useCoveyAppState';
import usePlayerName from '../../hooks/usePlayerName';
import useVideoContext from "../VideoCall/VideoFrontend/hooks/useVideoContext/useVideoContext";

export default function Creator(): JSX.Element {
    const { players, apiClient, currentTownID } = useCoveyAppState();
    const [currentTownBlockers, setcurrentTownBlockers] = useState<string[]>([]);
    const [currentTownCreator, setCurrentTownCreator] = useState<string>('');
    const [currentAdministrators, setCurrentAdministrators] = useState<string[]>([]);
    const toast = useToast();
    const { room } = useVideoContext();
    const {name} = usePlayerName();

    const updateSingleTownListings = useCallback(async () => {
        // console.log(apiClient);
        apiClient.listSingleTown({coveyTownID: currentTownID}).then((town)=>{setcurrentTownBlockers(town.blockers); setCurrentTownCreator(town.creator);setCurrentAdministrators(town.admins)})
        if(currentTownBlockers.find((bname)=>bname===name)){
            room.disconnect();
        }
      }, [apiClient, currentTownBlockers, currentTownID, name, room]);
      useEffect(() => {
        
        updateSingleTownListings();
        const timer = setInterval(updateSingleTownListings, 1000);
        
        return () => {
          clearInterval(timer)
        };
      }, [updateSingleTownListings]);

    return(
        <>
        {
        name === currentTownCreator &&   
        <Stack>
            <Text>
                You are the town creator
            </Text>         
            <Text>
                Players List: 
            </Text>
             <UnorderedList>
                {players.map((player)=>(
                player.userName !== currentTownCreator &&
                <ListItem key={player.id}>
                    <>
                    {player.userName}          
                    <Button onClick={
                        async () => {
                        await apiClient.addAdmin({
                        coveyTownID: currentTownID,
                        AdminName: player.userName,
                        });toast({
                            title: `Assign User as a addAdmin!`,
                            description: `${player.userName} is assigned`,
                            status: 'success',
                            isClosable: true,
                            duration: 2000,
                          })}}
                    colorScheme="green" size="sm">
                        Assign administrator
                    </Button>
                    
                    <Button onClick={
                        async () => {
                        await apiClient.addBlocker({
                        coveyTownID: currentTownID,
                        blockerName: player.userName,
                        });toast({
                            title: `Block User!`,
                            description: `${player.userName} is blocked`,
                            status: 'success',
                            isClosable: true,
                            duration: 2000,
                          })}}
                    colorScheme="red" size="sm">Block player</Button>
                    </>
                 </ListItem>
                ))}
            </UnorderedList>
            <Text>
                Admin List: 
            </Text>
            <UnorderedList>
                {currentAdministrators.map((admin)=>(
                <ListItem key={admin}>
                    <>
                    {admin}
                    <Button onClick = {async () =>{await apiClient.deleteAdminByTownId({
                        adminName:admin,
                        coveyTownID:currentTownID});
                        toast({
                            title: `unBlock User!`,
                            description: `${admin} is unblocked`,
                            status: 'success',
                            isClosable: true,
                            duration: 2000,
                          })
                    }}
                    colorScheme="red" size="sm">
                        Unassign admin
                    </Button>
                    </>
                 </ListItem>
                ))}
            </UnorderedList>

            <Text>
                Blocker List: 
            </Text>
            <UnorderedList>
                {currentTownBlockers.map((blocker)=>(
                <ListItem key={blocker}>
                    <>
                    {blocker}
                    <Button onClick = {async () =>{await apiClient.deleteBlockerByTownId({
                        blockerName:blocker,
                        coveyTownID:currentTownID});
                        toast({
                            title: `unBlock User!`,
                            description: `${blocker} is unblocked`,
                            status: 'success',
                            isClosable: true,
                            duration: 2000,
                          })
                    }}
                    colorScheme="green" size="sm">
                        Unblock player
                    </Button>
                    </>
                 </ListItem>
                ))}
            </UnorderedList>
        </Stack>
        }

{
        name === currentAdministrators.find((admin)=>admin ===name) &&   
        <Stack>
            <Text>
                You are a town administrator
            </Text>         
            <Text>
                Players List: 
            </Text>
             <UnorderedList>
                {players.map((player)=>(
                
                player.userName !== currentTownCreator && player.userName !== currentAdministrators.find((admin)=>admin ===player.userName) &&
                <ListItem key={player.id}>
                    <>
                    {player.userName}
                    <Button onClick={
                        async () => {
                        await apiClient.addBlocker({
                        coveyTownID: currentTownID,
                        blockerName: player.userName,
                        });toast({
                            title: `Block User!`,
                            description: `${player.userName} is blocked`,
                            status: 'success',
                            isClosable: true,
                            duration: 2000,
                          })}}
                    colorScheme="red" size="sm">Block player</Button>
                    </>
                 </ListItem>
           
                ))}
            </UnorderedList>
            <Text>
                Blocker List: 
            </Text>
            <UnorderedList>
                {currentTownBlockers.map((blocker)=>(
                <ListItem key={blocker}>
                    <>
                    {blocker}
                    <Button onClick = {async () =>{await apiClient.deleteBlockerByTownId({
                        blockerName:blocker,
                        coveyTownID:currentTownID});
                        toast({
                            title: `unBlock User!`,
                            description: `${blocker} is unblocked`,
                            status: 'success',
                            isClosable: true,
                            duration: 2000,
                          })
                    }}
                    colorScheme="green" size="sm">
                        Unblock player
                    </Button>
                    </>
                 </ListItem>
                ))}
            </UnorderedList>
        </Stack>
        }
        
        </>
    )
}