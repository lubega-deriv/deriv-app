import { Context } from '../../utils/mocks/mocks';

export default function mockP2pAdvertiserInfo(context: Context) {
    if ('p2p_advertiser_info' in context.request && context.request.p2p_advertiser_info === 1) {
        context.response = {
            echo_req: context.request,
            msg_type: 'p2p_advertiser_info',
            p2p_advertiser_info: {
                advert_rates: null,
                balance_available: 0,
                basic_verification: 0,
                blocked_by_count: 0,
                buy_completion_rate: null,
                buy_orders_amount: '0.00',
                buy_orders_count: 0,
                buy_time_avg: null,
                cancel_time_avg: null,
                cancels_remaining: 3,
                chat_token: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                chat_user_id: 'p2puser_CR_390523_1689077947',
                contact_info: '',
                created_time: 1689077948,
                daily_buy: '0.00',
                daily_buy_limit: '500.00',
                daily_sell: '0.00',
                daily_sell_limit: '500.00',
                default_advert_description: '',
                full_verification: 0,
                id: '390523',
                is_approved: 0,
                is_listed: 1,
                is_online: 1,
                last_online_time: 1694691422,
                max_order_amount: '500.00',
                min_order_amount: '1.00',
                name: 'joebloggs-deriv',
                partner_count: 0,
                payment_info: '',
                rating_average: null,
                rating_count: 0,
                recommended_average: null,
                recommended_count: null,
                release_time_avg: null,
                sell_completion_rate: null,
                sell_orders_amount: '0.00',
                sell_orders_count: 0,
                show_name: 0,
                total_completion_rate: null,
                total_orders_count: 0,
                total_turnover: '0.00',
                withdrawal_limit: '10000.00',
            },
            req_id: context.req_id,
        };
    }
}
