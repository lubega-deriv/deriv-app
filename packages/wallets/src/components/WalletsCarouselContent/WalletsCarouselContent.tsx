import React, { useCallback, useEffect, useRef, useState } from 'react';
import useEmblaCarousel, { EmblaCarouselType, EmblaEventType } from 'embla-carousel-react';
import { useActiveWalletAccount, useAuthorize, useCurrencyConfig, useMobileCarouselWalletsList } from '@deriv/api-v2';
import { ProgressBar } from '../Base';
import { WalletsCarouselLoader } from '../SkeletonLoader';
import { WalletCard } from '../WalletCard';
import { WalletListCardActions } from '../WalletListCardActions';
import './WalletsCarouselContent.scss';

type TProps = {
    onWalletSettled?: (value: boolean) => void;
};

type NumberWithinRangeProps = {
    max: number;
    min: number;
    number: number;
};

/**
 * carousel component
 * idea behind data flow here:
 * - Embla is the SINGLE SOURCE OF TRUTH for current active card, so the state flow / data flow is simple
 * - everything else gets in sync with Embla eventually
 */
const WalletsCarouselContent: React.FC<TProps> = ({ onWalletSettled }) => {
    const { switchAccount } = useAuthorize();
    const { data: walletAccountsList, isLoading: isWalletAccountsListLoading } = useMobileCarouselWalletsList();
    const { data: activeWallet, isLoading: isActiveWalletLoading } = useActiveWalletAccount();
    const { isLoading: isCurrencyConfigLoading } = useCurrencyConfig();

    const [selectedLoginId, setSelectedLoginId] = useState('');
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);

    // for the embla "on select" callback
    // to avoid unbinding / cleaning etc, just let it use up-to-date list
    const walletsAccountsListRef = useRef(walletAccountsList);
    const transitionNodes = useRef<HTMLElement[]>([]);
    const transitionFactor = useRef(0);

    const numberWithinRange = ({ max, min, number }: NumberWithinRangeProps): number =>
        Math.min(Math.max(number, min), max);

    // scale based on the width difference between active and inactive wallets
    const transitionFactorScale = 1 - 24 / 28.8;

    // sets the transition nodes to be scaled
    const setTransitionNodes = useCallback((walletsCarouselEmblaApi: EmblaCarouselType) => {
        // find and store all available wallet card containers for the transition nodes
        transitionNodes.current = walletsCarouselEmblaApi.slideNodes().map(slideNode => {
            return slideNode.querySelector('.wallets-card__container') as HTMLElement;
        });
    }, []);

    // function to set the transition factor based on the number of scroll snaps
    const setTransitionFactor = useCallback(
        (walletsCarouselEmblaApi: EmblaCarouselType) => {
            transitionFactor.current = transitionFactorScale * walletsCarouselEmblaApi.scrollSnapList().length;
        },
        [transitionFactorScale]
    );

    // function to interpolate the scale of wallet cards based on scroll events
    const transitionScale = useCallback(
        (walletsCarouselEmblaApi: EmblaCarouselType, walletsCarouselEvent?: EmblaEventType) => {
            const engine = walletsCarouselEmblaApi.internalEngine();
            const scrollProgress = walletsCarouselEmblaApi.scrollProgress();
            const slidesInView = walletsCarouselEmblaApi.slidesInView();
            const isScrollEvent = walletsCarouselEvent === 'scroll';

            walletsCarouselEmblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
                //scrollProgress returns the progress for the whole list with a value of 0<x<1 while scrollSnap return the position of the item in the array
                //difference between the array item position and the progress in the whole scroll event is calculated to determine the transition value
                let diffToTarget = scrollSnap - scrollProgress;
                const slidesInSnap = engine.slideRegistry[snapIndex];

                slidesInSnap.forEach(slideIndex => {
                    if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

                    // iterate through the loop points in the carousel engine using the embla API internal engine
                    if (engine.options.loop) {
                        engine.slideLooper.loopPoints.forEach(loopItem => {
                            const target = loopItem.target();

                            // determine the direction of the loop based on the sign and adjust the difference to the target based on loop direction
                            if (slideIndex === loopItem.index && target !== 0) {
                                const sign = Math.sign(target);

                                if (sign === -1) {
                                    diffToTarget = scrollSnap - (1 + scrollProgress);
                                }
                                if (sign === 1) {
                                    diffToTarget = scrollSnap + (1 - scrollProgress);
                                }
                            }
                        });
                    }

                    // calculate transition scale value based on the scroll position
                    // active wallet will scale down until it reaches the point where width is 24rem and vice versa
                    const transitionValue = 1 - Math.abs(diffToTarget * transitionFactor.current);
                    const scale = numberWithinRange({ max: 1, min: 0, number: transitionValue }).toString();

                    // apply the scale to the wallet cards
                    const transitionNode = transitionNodes.current[slideIndex];
                    transitionNode.style.transform = `scale(${scale})`;
                });
            });
        },
        []
    );

    const [walletsCarouselEmblaRef, walletsCarouselEmblaApi] = useEmblaCarousel({
        containScroll: false,
        skipSnaps: true,
    });

    useEffect(() => {
        walletsAccountsListRef.current = walletAccountsList;
    }, [walletAccountsList]);

    // set login ID once wallet changes
    useEffect(() => {
        if (activeWallet) {
            setSelectedLoginId(activeWallet?.loginid);
        }
    }, [activeWallet]);

    // bind to embla events
    useEffect(() => {
        walletsCarouselEmblaApi?.on('select', () => {
            const index = walletsCarouselEmblaApi?.selectedScrollSnap();
            if (index === undefined) {
                return;
            }
            const loginId = walletsAccountsListRef?.current?.[index]?.loginid;

            loginId && setSelectedLoginId(loginId);
        });

        // on settle, this is only for tutorial / onboarding plugin in some other components,
        walletsCarouselEmblaApi?.on('settle', () => {
            onWalletSettled?.(true);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [walletsCarouselEmblaApi]);

    // load active wallet whenever its scrolled
    useEffect(() => {
        if (selectedLoginId) {
            switchAccount(selectedLoginId);
            const index = walletAccountsList?.findIndex(({ loginid }) => loginid === selectedLoginId) ?? -1;
            walletsCarouselEmblaApi?.scrollTo(index);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedLoginId, walletAccountsList]);

    // initial loading
    useEffect(() => {
        if (walletsCarouselEmblaApi && isInitialDataLoaded) {
            const index = walletAccountsList?.findIndex(({ loginid }) => loginid === selectedLoginId) ?? -1;
            walletsCarouselEmblaApi?.scrollTo(index, true);

            walletsCarouselEmblaApi && setTransitionNodes(walletsCarouselEmblaApi);
            walletsCarouselEmblaApi && setTransitionFactor(walletsCarouselEmblaApi);
            walletsCarouselEmblaApi && transitionScale(walletsCarouselEmblaApi);

            walletsCarouselEmblaApi
                ?.on('reInit', setTransitionNodes)
                .on('reInit', setTransitionFactor)
                .on('reInit', transitionScale)
                .on('scroll', transitionScale);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [walletsCarouselEmblaApi, isInitialDataLoaded, transitionScale]);

    useEffect(() => {
        const index = walletAccountsList?.findIndex(({ loginid }) => loginid === selectedLoginId) ?? -1;
        if (index >= 0) {
            setCurrentIndex(index);
        }
    }, [selectedLoginId, walletAccountsList]);

    // set the initial data loading flag to false once all "is loading" flags are false,
    // as then and only then we can display all the stuff and we want to display it permanently after that
    useEffect(() => {
        if (!isWalletAccountsListLoading && !isActiveWalletLoading && !isCurrencyConfigLoading) {
            setIsInitialDataLoaded(true);
        }
    }, [isWalletAccountsListLoading, isActiveWalletLoading, isCurrencyConfigLoading]);

    if (!isInitialDataLoaded) {
        return <WalletsCarouselLoader />;
    }

    return (
        <div className='wallets-carousel-content' ref={walletsCarouselEmblaRef}>
            <div className='wallets-carousel-content__container'>
                {walletAccountsList?.map(account => (
                    <WalletCard
                        balance={account.display_balance}
                        currency={account.currency || 'USD'}
                        iconSize='xl'
                        isCarouselContent
                        isDemo={account.is_virtual}
                        key={`wallet-card-${account.loginid}`}
                        landingCompanyName={account.landing_company_name}
                    />
                ))}
            </div>
            <div className='wallets-carousel-content__progress-bar'>
                <ProgressBar
                    activeIndex={currentIndex}
                    count={walletAccountsList?.length ?? 0}
                    onClick={walletsCarouselEmblaApi?.scrollTo}
                />
            </div>
            <WalletListCardActions />
        </div>
    );
};

export default WalletsCarouselContent;
