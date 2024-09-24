import React, { useEffect, useRef } from 'react';
import { useDerivAccountsList, useSettings } from '@deriv/api-v2';
import { Analytics } from '@deriv-com/analytics';
import { useTranslations } from '@deriv-com/translations';
import useAllBalanceSubscription from './hooks/useAllBalanceSubscription';
import { defineViewportHeight } from './utils/utils';
import { Router } from './routes';
import './AppContent.scss';

type LanguageType = 'AR' | 'EN';
type AppContentProps = {
    setPreferredLanguage: (language: LanguageType | null) => void;
};

const AppContent: React.FC<AppContentProps> = ({ setPreferredLanguage }) => {
    const { isSubscribed, subscribeToAllBalance, unsubscribeFromAllBalance } = useAllBalanceSubscription();
    const { data: derivAccountList } = useDerivAccountsList();
    const {
        data: { preferred_language: preferredLanguage },
    } = useSettings();
    const { switchLanguage } = useTranslations();
    const previousDerivAccountListLenghtRef = useRef(0);

    useEffect(() => {
        if (preferredLanguage) {
            setPreferredLanguage(preferredLanguage as LanguageType);
            switchLanguage(preferredLanguage as LanguageType);
        } else {
            setPreferredLanguage(null);
        }
    }, [preferredLanguage, setPreferredLanguage, switchLanguage]);

    useEffect(() => {
        if (!derivAccountList?.length) return;
        if (previousDerivAccountListLenghtRef.current !== derivAccountList.length || !isSubscribed) {
            subscribeToAllBalance();
            previousDerivAccountListLenghtRef.current = derivAccountList.length;
        }
        return () => {
            if (isSubscribed) {
                unsubscribeFromAllBalance();
            }
        };
    }, [derivAccountList?.length, isSubscribed, subscribeToAllBalance, unsubscribeFromAllBalance]);

    useEffect(() => {
        defineViewportHeight();
    }, []);

    useEffect(() => {
        Analytics.trackEvent('ce_wallets_homepage_form', {
            action: 'open',
            form_name: 'ce_wallets_homepage_form',
        });
    }, []);

    return (
        <div className='wallets-app'>
            <div className='wallets-modal-show-header-root' id='wallets_modal_show_header_root' />
            <Router />
        </div>
    );
};

export default AppContent;
