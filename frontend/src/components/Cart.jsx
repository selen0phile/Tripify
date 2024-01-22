import { DeleteIcon, ExternalLinkIcon } from "@chakra-ui/icons"
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Button, Flex, IconButton, Input, Link, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Table, TableContainer, Tbody, Td, Text, Textarea, Th, Tr } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import DatePicker from "react-datepicker"
import { createTrip } from "../API"
import { taka } from "../Constants"
import { getList, removeFromList } from "../LocalStorage"
import ImageUploader from "./ImageUploader"

export default function Cart({ open, setOpen }) {
  const [hotels, setHotels] = useState([])
  const [destinations, setDestinations] = useState([])
  const [activities, setActivities] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [totalCost, setTotalCost] = useState(0)
  const [body, setBody] = useState({
    name: '',
    description: '',
    startDate: new Date(),
    endDate: new Date()
  })
  function handleChange(e) {
    if (e.target !== undefined) {
      setBody({
        ...body,
        [e.target.name]: e.target.value
      })
    }
  }
  function handleChange_(x, y) {
    body[x] = y
    setBody({ ...body })
  }
  function load() {
    const h = getList('_hotels')
    setHotels(h)
    setDestinations(getList('_destinations'))
    const a = getList('_activities')
    setActivities(a)
    const r = getList('_restaurants')
    setRestaurants(r)
    var s = 0
    h.forEach(x => s += parseInt(x.cost))
    a.forEach(x => s += parseInt(x.cost))
    r.forEach(x => s += parseInt(x.cost))
    setTotalCost(s)
  }
  useEffect(() => {
    if (open) load()
  }, [open])

  function closeModal() {
    setOpen(false)
  }
  function formatDate(x) {
    return new Date(x).toISOString().split("T")[0]
  }
  async function save() {
    var t = body
    t['from_city_id'] = '1'
    t['to_city_id'] = '1'
    t['image_url'] = ''
    t['name'] = body.name
    t['description'] = body.description
    t['start_date'] = body.startDate.toISOString().split('T')[0]
    // delete t['startDate']
    // delete t['endDate']
    alert(t['start_date'])
    t['end_date'] = body.endDate.toISOString().split('T')[0]
    t['hotels'] = []
    hotels.forEach(x => t['hotels'].push({ hotel_id: x.id, checkin_date: formatDate(x.start), checkout_date: formatDate(x.end) }))
    t['contains'] = []
    activities.forEach(x => t['contains'].push({ destination_id: x.destination_id, activity_id: x.id, tentative_date: formatDate(x.date) }))
    t['restaurants'] = []
    restaurants.forEach(x => t['restaurants'].push({ restaurant_id: x.id }))
    t['guides'] = []

    console.log(t)
    await createTrip(t)
    closeModal()
  }
  
  function setImageURL(x) {
    t['image_url'] = x
  }

  return (
    <Modal onClose={closeModal} size={'lg'} isOpen={open} isCentered scrollBehavior={'inside'}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Trip Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box>
            <Accordion defaultIndex={[1, 5]} allowMultiple>
              <AccordionItem>
                <AccordionButton>
                  <Box as="span" flex='1' textAlign='left'>
                    <Text fontSize={'xl'} fontWeight={'500'}>Basic Info</Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <Table variant={'simple'} size='sm'>
                    <Tbody>
                      <Tr><Th>Name</Th><Td><Input name={'name'} variant={'solid'} borderWidth={'2px'} value={body.name} onChange={handleChange} /></Td></Tr>
                      <Tr><Th>Description</Th><Td><Textarea variant={'solid'} borderWidth={'2px'} name={'description'} value={body.description} onChange={handleChange} /></Td></Tr>
                      <Tr><Th>Start Date</Th><Td>
                        <DatePicker selected={body.startDate} onChange={x => handleChange_('startDate', x)} />
                      </Td></Tr>
                      <Tr><Th>End Date</Th><Td>
                        <DatePicker selected={body.endDate} onChange={x => handleChange_('endDate', x)} />
                      </Td></Tr>
                      <Tr><Th>Image</Th><Td>
                        <ImageUploader setURL={setImageURL} />
                      </Td></Tr>

                    </Tbody>
                  </Table>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionButton>
                  <Box as="span" flex='1' textAlign='left'>
                    <Text fontSize={'xl'} fontWeight={'500'}>Hotels ({hotels.length})</Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  {
                    hotels.map((hotel, id) =>
                      <Flex key={id} alignItems={'center'} justifyContent={'space-between'} padding={'10px'}>
                        <TableContainer>
                          <Table variant='simple' size='sm'>
                            <Tbody>
                              <Tr ><Th>Name</Th><Td>
                                <Flex alignItems={'center'}>
                                  <Link href={'/hotel/' + hotel.id} isExternal alignItems={'center'}>
                                    {hotel.name}
                                  </Link>
                                  <ExternalLinkIcon mx='2px' />
                                </Flex>
                              </Td></Tr>
                              <Tr><Th>Start Date</Th><Td>{new Date(hotel.start).toLocaleDateString()}</Td></Tr>
                              <Tr><Th>End Date</Th><Td>{new Date(hotel.end).toLocaleDateString()}</Td></Tr>
                              <Tr><Th>Cost</Th><Td>৳{hotel.cost}</Td></Tr>
                            </Tbody>
                          </Table>
                        </TableContainer>
                        <Box>
                          <IconButton
                            colorScheme='red'
                            icon={<DeleteIcon />}
                            onClick={() => {
                              removeFromList('_hotels', hotel)
                              load()
                            }}
                          />
                        </Box>
                      </Flex>
                    )
                  }
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionButton>
                  <Box as="span" flex='1' textAlign='left'>
                    <Text fontSize={'xl'} fontWeight={'500'}>Destinations ({destinations.length})</Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  {
                    destinations.map((destination, id) =>
                      <Flex key={id} alignItems={'center'} justifyContent={'space-between'}>
                        <TableContainer margin={'10px'}>
                          <Table variant='simple' size='sm'>
                            <Tbody>
                              <Tr><Th>Name</Th><Td>
                                <Flex alignItems={'center'}>
                                  <Link href={'/destination/' + destination.id} isExternal alignItems={'center'}>
                                    {destination.name}
                                  </Link>
                                  <ExternalLinkIcon mx='2px' />
                                </Flex>
                              </Td></Tr>
                              <Tr><Th>Address</Th><Td>{destination.address}</Td></Tr>
                              <Tr><Th>Start Date</Th><Td>{new Date(destination.start).toLocaleDateString()}</Td></Tr>
                              <Tr><Th>End Date</Th><Td>{new Date(destination.end).toLocaleDateString()}</Td></Tr>
                            </Tbody>
                          </Table>
                        </TableContainer>
                        <Box>
                          <IconButton
                            colorScheme='red'
                            icon={<DeleteIcon />}
                            onClick={() => {
                              removeFromList('_destinations', destination)
                              load()
                            }}
                          />
                        </Box>
                      </Flex>
                    )
                  }
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionButton>
                  <Box as="span" flex='1' textAlign='left'>
                    <Text fontSize={'xl'} fontWeight={'500'}>Activities ({activities.length})</Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  {
                    activities.map((activity, id) =>
                      <Flex key={id} alignItems={'center'} justifyContent={'space-between'}>
                        <TableContainer margin={'10px'}>
                          <Table variant='simple' size='sm'>
                            <Tbody>
                              <Tr><Th>Name</Th><Td>
                                <Flex alignItems={'center'}>
                                  <Link href={'/activity/' + activity.id} isExternal alignItems={'center'}>
                                    {activity.name}
                                  </Link>
                                  <ExternalLinkIcon mx='2px' />
                                </Flex>
                              </Td></Tr>
                              <Tr><Th>Destination</Th><Td>{activity.destination}</Td></Tr>
                              <Tr><Th>Date</Th><Td>{new Date(activity.date).toLocaleDateString()}</Td></Tr>
                              <Tr><Th>Persons</Th><Td>{activity.persons}</Td></Tr>
                              <Tr><Th>Cost</Th><Td>৳{activity.cost}</Td></Tr>
                            </Tbody>
                          </Table>
                        </TableContainer>
                        <Box>
                          <IconButton
                            colorScheme='red'
                            icon={<DeleteIcon />}
                            onClick={() => {
                              removeFromList('_activities', activity)
                              load()
                            }}
                          />
                        </Box>
                      </Flex>
                    )
                  }
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionButton>
                  <Box as="span" flex='1' textAlign='left'>
                    <Text fontSize={'xl'} fontWeight={'500'}>Restaurants ({restaurants.length})</Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  {
                    restaurants.map((restaurant, id) =>
                      <Flex key={id} alignItems={'center'} justifyContent={'space-between'}>
                        <TableContainer margin={'10px'}>
                          <Table variant='simple' size='sm'>
                            <Tbody>
                              <Tr><Th>Name</Th><Td>
                                <Flex alignItems={'center'}>
                                  <Link href={'/restaurant/' + restaurant.id} isExternal alignItems={'center'}>
                                    {restaurant.name}
                                  </Link>
                                  <ExternalLinkIcon mx='2px' />
                                </Flex>
                              </Td></Tr>
                              <Tr><Th>Address</Th><Td>{restaurant.address}</Td></Tr>
                              <Tr><Th>Cost</Th><Td>৳{restaurant.cost}</Td></Tr>
                            </Tbody>
                          </Table>
                        </TableContainer>
                        <Box>
                          <IconButton
                            colorScheme='red'
                            icon={<DeleteIcon />}
                            onClick={() => {
                              removeFromList('_restaurants', restaurant)
                              load()
                            }}
                          />
                        </Box>
                      </Flex>
                    )
                  }
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionButton>
                  <Box as="span" flex='1' textAlign='left'>
                    <Text fontSize={'xl'} fontWeight={'500'}>Summary</Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <Table variant={'simple'} size='sm'>
                    <Tbody>
                      <Tr><Th>Total Cost</Th><Td>{taka}{totalCost}</Td></Tr>
                    </Tbody>
                  </Table>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionButton>
                  <Box as="span" flex='1' textAlign='left'>
                    <Text fontSize={'xl'} fontWeight={'500'}>Clear Trip</Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <Flex justifyContent={'right'}>
                    <IconButton colorScheme='red' size={'lg'} icon={<DeleteIcon />} />
                  </Flex>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </Box >
        </ModalBody>
        <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'} margin='12px'>
          <Box>
            <Button margin='10px' colorScheme='blue' onClick={save}>Save</Button>
          </Box>
          <Box>
            <Button margin='10px' onClick={closeModal}>Cancel</Button>
          </Box>
        </Box>
      </ModalContent>
    </Modal>
  )
}