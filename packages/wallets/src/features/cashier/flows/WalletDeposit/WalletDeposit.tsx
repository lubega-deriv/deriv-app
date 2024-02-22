import React from 'react';
import { useActiveWalletAccount } from '@deriv/api-v2';
import { DepositCryptoModule, DepositFiatModule } from '../../modules';
import { CashierLocked, DepositLocked } from '../../screens';

const WalletDeposit = () => {
    const { data } = useActiveWalletAccount();
    const isCrypto = data?.currency_config?.is_crypto;

    if (isCrypto) {
        return (
            <CashierLocked>
                <DepositLocked>
                    <DepositCryptoModule />
                </DepositLocked>
            </CashierLocked>
        );
    }

    return (
        <CashierLocked>
            <DepositLocked>
                <DepositFiatModule />
            </DepositLocked>
        </CashierLocked>
    );
};

export default WalletDeposit;
