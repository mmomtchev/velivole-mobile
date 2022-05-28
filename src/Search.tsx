import React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';

import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import i18n from 'i18n-js';

import { IGeoDB, siteName } from './GeoDB';
import { GeoJSONFeature } from './server';

const styles = StyleSheet.create({
    search: {
        width: '100%',
        borderWidth: 0,
        zIndex: 1,
    },
    autoCompleteInput: {
        width: '100%'
    }
});

export default function Search(props: {
    db: IGeoDB;
    dbPlus: IGeoDB | undefined;
    onChange: (site: GeoJSONFeature) => void;
}) {
    const [data, setData] = React.useState<GeoJSONFeature[]>([]);
    const [query, setQuery] = React.useState<string>('');

    React.useEffect(() => {
        if (query.length >= 3) {
            props.db.search(query).then((r) => {
                if (props.dbPlus)
                    return props.dbPlus.search(query).then((plus) => {
                        return r.concat(plus);
                    });
                return r;
            }).then((r) => setData(r));
        } else {
            setData([]);
        }
    }, [query, props.db]);

    return (
        <View style={styles.search}>
            <AutocompleteDropdown
                emptyResultText={i18n.t('Nothing found')}
                dataSet={data.map((i) => ({
                    id: JSON.stringify(i),
                    title: siteName(i)
                }))}
                onClear={() => setQuery('')}
                onChangeText={(text) => setQuery(text)}
                textInputProps={{
                    style: styles.autoCompleteInput,
                    placeholder: i18n.t('Search Locations')
                }}
                inputContainerStyle={styles.autoCompleteInput}
                onSelectItem={(item) => item && props.onChange(JSON.parse(item.id))}
            />
        </View>
    );
}