import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

import { IGeoDB } from './GeoDB';
import { GeoItem } from './GeoItem';
import { GeoJSONFeature } from './server';

const styles = StyleSheet.create({
    List: {
        flex: 1,
        backgroundColor: '#bbdefb',
        padding: 5,
        margin: 5,
        width: '98%'
    },
    deleteButton: {
        position: 'absolute',
        width: 30,
        height: 30,
        right: 5,
        backgroundColor: '#007bff',
        justifyContent: 'center',
        alignContent: 'center',
    },
    deleteButtonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: '900'
    },
    favItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        borderWidth: 1,
        borderColor: 'gray',
        width: '100%',
        padding: 5
    }
});

function Item(props: { item: GeoJSONFeature, onSelect: () => void, onDelete: () => void; }) {
    return (
        <TouchableOpacity style={styles.favItem} onPress={props.onSelect}>
            <GeoItem item={props.item} />
            <TouchableOpacity style={styles.deleteButton} onPress={props.onDelete}>
                <Text style={styles.deleteButtonText}>X</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );
}

export default function Favorites(props: {
    db: IGeoDB,
    dummy: Record<string, never>,
    onSelect: (item: GeoJSONFeature) => void;
    onDelete: (item: GeoJSONFeature) => void;
}) {
    const [favorites, setFavorites] = React.useState<GeoJSONFeature[]>([]);

    React.useEffect(() => {
        props.db.all().then((list) => setFavorites(list));
    }, [props.dummy, props.db]);

    return (
        <FlatList style={styles.List}
            data={favorites}
            keyExtractor={(item) => (item.id || 0).toString()}
            renderItem={(item) =>
                <Item
                    item={item.item}
                    onSelect={() => props.onSelect(item.item)}
                    onDelete={() => props.onDelete(item.item)}
                />}
        />
    );
}
