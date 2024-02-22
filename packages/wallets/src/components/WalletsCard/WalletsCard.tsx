import React, { useEffect, useRef } from 'react';
import { THooks } from '../../types';
import './WalletsCard.scss';

type TProps = {
    isDemo?: THooks.WalletAccountsList['is_virtual'];
    isOpen?: THooks.WalletAccountsList['is_active'];
    renderHeader: () => React.ReactNode;
};

const WalletsCard: React.FC<React.PropsWithChildren<TProps>> = ({
    children,
    isDemo = false,
    isOpen = false,
    renderHeader,
}) => {
    const walletsCardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (isOpen && walletsCardRef?.current) {
                walletsCardRef.current.style.scrollMarginTop = '24px';
                walletsCardRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }, 300);
        return () => clearTimeout(timeout);
    }, [isOpen]);

    return (
        <div
            className={`wallets-card wallets-card ${isDemo ? 'wallets-card wallets-card--virtual' : ''}`}
            ref={walletsCardRef}
        >
            <div
                className={`wallets-card__header wallets-card__header ${
                    isDemo ? 'wallets-card__header wallets-card__header--virtual' : ''
                }`}
            >
                {renderHeader()}
            </div>
            <div className={`wallets-card__content wallets-card__content--visible`}>{children}</div>
        </div>
    );
};

export default WalletsCard;
