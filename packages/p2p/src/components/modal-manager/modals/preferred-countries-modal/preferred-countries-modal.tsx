import React from 'react';
import { MobileFullPageModal, Modal, Text } from '@deriv/components';
import { useDevice } from '@deriv-com/ui';
import { localize, Localize } from 'Components/i18next';
import { useModalManagerContext } from 'Components/modal-manager/modal-manager-context';
import PreferredCountriesModalBody from './preferred-countries-modal-body';
import PreferredCountriesModalFooter from './preferred-countries-modal-footer';

type TPreferredCountriesModal = {
    country_list: { text: string; value: string }[];
    eligible_countries: string[];
    onApply?: (value: string[]) => void;
};

const PreferredCountriesModal = ({ country_list, eligible_countries, onApply }: TPreferredCountriesModal) => {
    const { isDesktop } = useDevice();
    const [search_value, setSearchValue] = React.useState('');
    const { hideModal, is_modal_open, showModal, useSavedState } = useModalManagerContext();
    const [selected_countries, setSelectedCountries] = useSavedState('selected_countries', eligible_countries);

    const onApplySelectedCountries = () => {
        onApply?.(selected_countries);
        hideModal();
    };

    const onClear = () => setSelectedCountries([]);
    const onLeave = () => {
        if (selected_countries === eligible_countries) {
            hideModal();
        } else {
            showModal({
                key: 'LeavePageModal',
                props: {},
            });
        }
    };

    if (isDesktop) {
        return (
            <Modal
                className='preferred-countries-modal'
                height='65rem'
                is_open={is_modal_open}
                small
                title={localize('Preferred countries')}
                toggleModal={onLeave}
            >
                <Modal.Body className='preferred-countries-modal__body'>
                    <PreferredCountriesModalBody
                        country_list={country_list}
                        eligible_countries={eligible_countries}
                        search_value={search_value}
                        setSearchValue={setSearchValue}
                        selected_countries={selected_countries}
                        setSelectedCountries={setSelectedCountries}
                    />
                </Modal.Body>
                {!search_value && (
                    <Modal.Footer className='preferred-countries-modal__footer' has_separator>
                        <PreferredCountriesModalFooter
                            eligible_countries={eligible_countries}
                            onClear={onClear}
                            onApply={onApplySelectedCountries}
                            selected_countries={selected_countries}
                        />
                    </Modal.Footer>
                )}
            </Modal>
        );
    }

    return (
        <MobileFullPageModal
            body_className='preferred-countries-modal__body'
            height_offset='80px'
            is_flex
            is_modal_open={is_modal_open}
            page_footer_className='preferred-countries-modal__footer'
            pageHeaderReturnFn={onLeave}
            renderPageHeaderElement={
                <Text as='p' color='prominent' weight='bold'>
                    <Localize i18n_default_text='Preferred countries' />
                </Text>
            }
            renderPageFooterChildren={() => (
                <PreferredCountriesModalFooter
                    eligible_countries={eligible_countries}
                    onClear={onClear}
                    onApply={onApplySelectedCountries}
                    selected_countries={selected_countries}
                />
            )}
        >
            <PreferredCountriesModalBody
                country_list={country_list}
                eligible_countries={eligible_countries}
                search_value={search_value}
                setSearchValue={setSearchValue}
                selected_countries={selected_countries}
                setSelectedCountries={setSelectedCountries}
            />
        </MobileFullPageModal>
    );
};
export default PreferredCountriesModal;
