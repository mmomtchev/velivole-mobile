import React from 'react';
import { Image, StyleSheet } from 'react-native';

import ServerAPI from './server';

const styles = StyleSheet.create({
    Ad: {
        marginTop: 5,
        paddingLeft: 5,
        paddingRight: 5,
        width: '95%',
        height: undefined,
        aspectRatio: 3.2
    },
});

export default function Ad({ }) {
    const [url, setUrl] = React.useState<string | undefined>(undefined);

    React.useEffect(() => {
        const update = () => {
            ServerAPI.getAd().then((ad) => {
                console.debug('Load new ad', ad);
                setUrl(ServerAPI.getUrl(ad.ad_img));
            });
        };
        const timer = setInterval(update, 1000 * 120);
        update();

        return () => clearInterval(timer);
    }, []);

    return <Image style={styles.Ad} source={{ uri: url }} />;
}
