import {
    FlatList,
    Keyboard, Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EventsStackNavigator from "../../navigation/EventsStackNavigator";
import SearchInput from "../../components/SearchInput";
import UIStyles from "../../styles/UI";
import styled from "styled-components/native";
import FilterEvents from "../../components/Filter/Filter";
import EventCard from "./components/EventCard";
import {useState, useEffect} from "react";
import {fetchEvents} from "../../utils/getEvents";
import moment from "moment";


const Events = () => {
    const [events, setEvents] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedSearch, setSelectedSearch] = useState('');
    const [refreshing, setRefreshing] = useState(true);
    const [lastVisible, setLastVisible] = useState(null);
    const [loadingMore, setLoadingMore] = useState(false);

    const fetchData = async (isLoadMore = false) => {
        try {
            const { events: newEvents, lastVisible: newLastVisible } = await fetchEvents(isLoadMore ? lastVisible : null);

            if (isLoadMore) {
                if (newEvents.length > 0) {
                    setEvents(prevEvents => [...prevEvents, ...newEvents]);
                    setLastVisible(newLastVisible);
                }
            } else {
                setEvents(newEvents);
                setLastVisible(newLastVisible);
            }

            setRefreshing(false);
            setLoadingMore(false);
        } catch (error) {
            console.error(error.message);
            setRefreshing(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);




    const handleLoadMore = () => {
        if (!loadingMore && lastVisible) {
            setLoadingMore(true);
            fetchData(true);
        }
        console.log(filteredEvents)
    };


    const handleCategoryChange = (categories) => {
        console.log(categories);
        setSelectedCategories(categories);
    };

    const handleSearchChange = (search) => {
        setSelectedSearch(search);
    };

    let filteredEvents = [];
    switch(true) {
        case selectedCategories.length > 0 && selectedSearch !== '':
            filteredEvents = events.filter(event => {
                const titleMatch = event.title.toLowerCase().includes(selectedSearch.toLowerCase());
                const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(event.category);
                return titleMatch && categoryMatch;
            });
            break;
        case selectedCategories.length > 0:
            filteredEvents = events.filter(event => selectedCategories.includes(event.category));
            break;
        case selectedSearch !== '':
            filteredEvents = events.filter(event => event.title.toLowerCase().includes(selectedSearch.toLowerCase()));
            break;
        default:
            filteredEvents = events;
    }


    return(

        <EventsScreen >
            <StatusBar barStyle={Platform.OS === 'ios' ? "dark-content" : 'dark-content'} backgroundColor={'white'}/>

                    <SearchInput onSearchChange={handleSearchChange} onFilterChange={handleCategoryChange} title={'Івенти'} />
                    <FilterEvents onFilterChange={handleCategoryChange}/>
                    <EventsList
                        data={filteredEvents}
                        renderItem={({item}) => <EventCard itemID={item.id} title={item.title} image={item.image} date={item.date} location={item.location} />}
                        keyExtractor={item => item.id}
                        keyboardShouldPersistTaps='handled'
                        keyboardDismissMode="on-drag"
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={() => fetchData()} />
                        }
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0}
                        ListFooterComponent={loadingMore ? <Text>Завантаження...</Text> : null}
                    />

                    {/*TODO: Fix bottom padding when scrolling*/}

                {/*<EventsStackNavigator />*/}


        </EventsScreen>

    )
}

const EventsScreen = styled(SafeAreaView)( () => ({
    background: UIStyles.colors.white,
    flex: 1,

}));

const EventsList = styled.FlatList( () => ({
    borderTopWidth: 1,
    borderTopColor: UIStyles.colors.grey,
    marginTop: 20,
    paddingLeft: 24,
    paddingRight: 24,
}));


export default Events;