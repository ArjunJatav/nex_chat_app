// actions.js
export const toggleTabBarVisibility = () => ({
    type: 'TOGGLE_TAB_BAR_VISIBILITY',
  });
  
  // reducers.js
  const initialState = {
    hideHeader: false,
  };
  
  export const tabBarController = (state = initialState, action) => {
    switch (action.type) {
      case 'TOGGLE_TAB_BAR_VISIBILITY':
        return {
          ...state,
          hideHeader: !state.hideHeader,
        };
      default:
        return state;
    }
  };
  